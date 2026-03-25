/**
 * Vilva Taskspace — Chat Module
 * Project-based group messaging with channels, reactions, threads, and mentions.
 */

import { api } from '@api/apiClient.js';
import { store } from '@store/store.js';
import { showToast } from '@components/toast.js';

let currentChannelId = null;
let pollInterval = null;
let lastMessageId = null;

// ── Render Chat Page ────────────────────────────────────────────────────────

export async function renderChat(container) {
  container.innerHTML = `
    <div class="chat-layout">
      <div class="chat-sidebar" id="chat-sidebar">
        <div class="chat-sidebar-head">
          <h3>Channels</h3>
        </div>
        <div class="chat-channel-list" id="chat-channel-list">
          <div class="spinner-wrap"><div class="spinner"></div></div>
        </div>
      </div>
      <div class="chat-main" id="chat-main">
        <div class="chat-empty-state">
          <div class="chat-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <p>Select a channel to start chatting</p>
        </div>
      </div>
    </div>`;

  await loadChannels();
}

// ── Load Channels ───────────────────────────────────────────────────────────

async function loadChannels() {
  try {
    const channels = await api.get('/chat/channels');
    const listEl = document.getElementById('chat-channel-list');
    if (!listEl) return;

    if (!channels || channels.length === 0) {
      listEl.innerHTML = '<p class="chat-no-channels">No channels yet. Create a project to get started!</p>';
      return;
    }

    listEl.innerHTML = channels.map(ch => `
      <div class="chat-channel-item ${ch.id === currentChannelId ? 'active' : ''}" data-channel-id="${ch.id}">
        <div class="chat-channel-info">
          <span class="chat-channel-dot" style="background:${ch.project?.color || '#6366f1'}"></span>
          <span class="chat-channel-name">${escapeHtml(ch.name)}</span>
        </div>
        <div class="chat-channel-meta">
          ${ch.unread_count > 0 ? `<span class="chat-unread-badge">${ch.unread_count}</span>` : ''}
          ${ch.latest_message ? `<span class="chat-last-time">${timeAgo(ch.latest_message.created_at)}</span>` : ''}
        </div>
        ${ch.latest_message ? `<div class="chat-channel-preview">${escapeHtml(ch.latest_message.user?.name || '')}: ${escapeHtml(ch.latest_message.body)}</div>` : ''}
      </div>
    `).join('');

    listEl.querySelectorAll('.chat-channel-item').forEach(el => {
      el.addEventListener('click', () => openChannel(parseInt(el.dataset.channelId)));
    });
  } catch (err) {
    console.error('Failed to load channels:', err);
  }
}

// ── Open Channel ────────────────────────────────────────────────────────────

async function openChannel(channelId) {
  currentChannelId = channelId;
  stopPolling();

  // Update sidebar active state
  document.querySelectorAll('.chat-channel-item').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.channelId) === channelId);
  });

  const mainEl = document.getElementById('chat-main');
  mainEl.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';

  try {
    const [channel, messagesRes] = await Promise.all([
      api.get(`/chat/channels/${channelId}`),
      api.get(`/chat/channels/${channelId}/messages`),
    ]);

    const messages = messagesRes.data || [];
    lastMessageId = messages.length > 0 ? messages[0].id : null;

    mainEl.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-info">
          <h3># ${escapeHtml(channel.name)}</h3>
          <span class="chat-header-members">${channel.members?.length || 0} members</span>
        </div>
        <div class="chat-header-actions">
          <button class="btn btn-ghost btn-sm" id="chat-members-btn" title="Members">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm" id="chat-pins-btn" title="Pinned messages">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
          </button>
        </div>
      </div>
      <div class="chat-messages" id="chat-messages">
        ${renderMessages(messages.reverse())}
      </div>
      <div class="chat-input-area">
        <div class="chat-input-wrap">
          <textarea class="chat-input" id="chat-input" placeholder="Type a message..." rows="1"></textarea>
          <button class="chat-send-btn" id="chat-send-btn" title="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
        </div>
      </div>`;

    // Scroll to bottom
    const msgContainer = document.getElementById('chat-messages');
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Send message handler
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');

    const sendMessage = async () => {
      const body = input.value.trim();
      if (!body) return;

      // Extract @mentions
      const mentionRegex = /@(\w+)/g;
      const mentionNames = [];
      let match;
      while ((match = mentionRegex.exec(body)) !== null) {
        mentionNames.push(match[1]);
      }

      input.value = '';
      input.style.height = 'auto';

      try {
        const msg = await api.post(`/chat/channels/${channelId}/messages`, {
          body,
          mentions: mentionNames.length > 0 ? mentionNames : null,
        });
        appendMessage(msg);
      } catch (err) {
        showToast('Failed to send message', 'error');
      }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    // Members panel
    document.getElementById('chat-members-btn')?.addEventListener('click', () => {
      showMembersPanel(channel.members);
    });

    // Reaction handlers
    bindMessageActions(channelId);

    // Start polling for new messages
    startPolling(channelId);

    // Remove unread badge
    const channelItem = document.querySelector(`.chat-channel-item[data-channel-id="${channelId}"]`);
    const badge = channelItem?.querySelector('.chat-unread-badge');
    if (badge) badge.remove();

  } catch (err) {
    mainEl.innerHTML = '<div class="chat-empty-state"><p>Failed to load channel</p></div>';
  }
}

// ── Render Messages ─────────────────────────────────────────────────────────

function renderMessages(messages) {
  if (!messages.length) {
    return '<div class="chat-no-messages">No messages yet. Say hello!</div>';
  }

  const user = store.get('user');
  let html = '';
  let lastDate = '';

  for (const msg of messages) {
    const msgDate = new Date(msg.created_at).toLocaleDateString();
    if (msgDate !== lastDate) {
      html += `<div class="chat-date-divider"><span>${msgDate}</span></div>`;
      lastDate = msgDate;
    }

    const isOwn = msg.user_id === user?.id;
    const isSystem = msg.type === 'system';

    if (isSystem) {
      html += `<div class="chat-msg-system">${escapeHtml(msg.body)}</div>`;
      continue;
    }

    const avatarUrl = msg.user?.avatar_url || msg.user?.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.user?.name || '?')}&size=32&background=6366f1&color=fff`;

    const reactions = msg.reactions?.length ? renderReactions(msg.reactions, user?.id) : '';
    const replyCount = msg.replies?.length || 0;

    html += `
      <div class="chat-msg ${isOwn ? 'chat-msg-own' : ''}" data-msg-id="${msg.id}">
        ${!isOwn ? `<img class="chat-msg-avatar" src="${avatarUrl}" alt="" />` : ''}
        <div class="chat-msg-content">
          <div class="chat-msg-header">
            <span class="chat-msg-name">${escapeHtml(msg.user?.name || 'Unknown')}</span>
            <span class="chat-msg-time">${formatTime(msg.created_at)}</span>
            ${msg.edited_at ? '<span class="chat-msg-edited">(edited)</span>' : ''}
          </div>
          <div class="chat-msg-body">${formatMessageBody(msg.body)}</div>
          ${reactions}
          ${replyCount > 0 ? `<div class="chat-msg-thread"><span>${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}</span></div>` : ''}
          <div class="chat-msg-actions">
            <button class="chat-action-btn" data-action="react" data-msg-id="${msg.id}" title="React">😊</button>
            <button class="chat-action-btn" data-action="reply" data-msg-id="${msg.id}" title="Reply">↩</button>
            ${isOwn ? `<button class="chat-action-btn" data-action="edit" data-msg-id="${msg.id}" title="Edit">✏️</button>` : ''}
            <button class="chat-action-btn" data-action="pin" data-msg-id="${msg.id}" title="Pin">📌</button>
          </div>
        </div>
      </div>`;
  }

  return html;
}

function renderReactions(reactions, currentUserId) {
  const grouped = {};
  for (const r of reactions) {
    if (!grouped[r.emoji]) grouped[r.emoji] = { count: 0, users: [], hasOwn: false };
    grouped[r.emoji].count++;
    grouped[r.emoji].users.push(r.user_id);
    if (r.user_id === currentUserId) grouped[r.emoji].hasOwn = true;
  }

  return '<div class="chat-reactions">' +
    Object.entries(grouped).map(([emoji, data]) =>
      `<span class="chat-reaction ${data.hasOwn ? 'own' : ''}" data-emoji="${emoji}">${emoji} ${data.count}</span>`
    ).join('') + '</div>';
}

// ── Message Actions ─────────────────────────────────────────────────────────

function bindMessageActions(channelId) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('.chat-action-btn');
    if (!btn) return;

    const action = btn.dataset.action;
    const msgId = btn.dataset.msgId;

    if (action === 'react') {
      const emojis = ['👍', '❤️', '😂', '🎉', '🤔', '👀'];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)]; // Quick react
      try {
        await api.post(`/chat/messages/${msgId}/react`, { emoji });
        // Refresh messages
        openChannel(channelId);
      } catch {}
    }

    if (action === 'pin') {
      try {
        const res = await api.post(`/chat/messages/${msgId}/pin`);
        showToast(res.is_pinned ? 'Message pinned' : 'Message unpinned', 'success');
      } catch {}
    }

    if (action === 'reply') {
      const input = document.getElementById('chat-input');
      if (input) {
        input.focus();
        input.placeholder = 'Replying to message...';
        input.dataset.replyTo = msgId;
      }
    }

    if (action === 'edit') {
      const msgEl = container.querySelector(`.chat-msg[data-msg-id="${msgId}"]`);
      const bodyEl = msgEl?.querySelector('.chat-msg-body');
      if (!bodyEl) return;

      const oldText = bodyEl.textContent;
      bodyEl.innerHTML = `<textarea class="chat-edit-input">${escapeHtml(oldText)}</textarea>
        <div class="chat-edit-actions">
          <button class="btn btn-sm btn-ghost chat-edit-cancel">Cancel</button>
          <button class="btn btn-sm btn-primary chat-edit-save">Save</button>
        </div>`;

      bodyEl.querySelector('.chat-edit-cancel').addEventListener('click', () => {
        bodyEl.innerHTML = formatMessageBody(oldText);
      });

      bodyEl.querySelector('.chat-edit-save').addEventListener('click', async () => {
        const newText = bodyEl.querySelector('.chat-edit-input').value.trim();
        if (!newText) return;
        try {
          await api.put(`/chat/messages/${msgId}`, { body: newText });
          bodyEl.innerHTML = formatMessageBody(newText);
          showToast('Message edited', 'success');
        } catch {}
      });
    }
  });
}

// ── Append New Message ──────────────────────────────────────────────────────

function appendMessage(msg) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const noMsg = container.querySelector('.chat-no-messages');
  if (noMsg) noMsg.remove();

  const user = store.get('user');
  const isOwn = msg.user_id === user?.id;
  const avatarUrl = msg.user?.avatar_url || msg.user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.user?.name || '?')}&size=32&background=6366f1&color=fff`;

  const div = document.createElement('div');
  div.className = `chat-msg ${isOwn ? 'chat-msg-own' : ''}`;
  div.dataset.msgId = msg.id;
  div.innerHTML = `
    ${!isOwn ? `<img class="chat-msg-avatar" src="${avatarUrl}" alt="" />` : ''}
    <div class="chat-msg-content">
      <div class="chat-msg-header">
        <span class="chat-msg-name">${escapeHtml(msg.user?.name || 'You')}</span>
        <span class="chat-msg-time">${formatTime(msg.created_at || new Date().toISOString())}</span>
      </div>
      <div class="chat-msg-body">${formatMessageBody(msg.body)}</div>
      <div class="chat-msg-actions">
        <button class="chat-action-btn" data-action="react" data-msg-id="${msg.id}" title="React">😊</button>
        <button class="chat-action-btn" data-action="reply" data-msg-id="${msg.id}" title="Reply">↩</button>
        ${isOwn ? `<button class="chat-action-btn" data-action="edit" data-msg-id="${msg.id}" title="Edit">✏️</button>` : ''}
        <button class="chat-action-btn" data-action="pin" data-msg-id="${msg.id}" title="Pin">📌</button>
      </div>
    </div>`;

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  lastMessageId = msg.id;
}

// ── Members Panel ───────────────────────────────────────────────────────────

function showMembersPanel(members) {
  let existing = document.querySelector('.chat-members-popup');
  if (existing) { existing.remove(); return; }

  const popup = document.createElement('div');
  popup.className = 'chat-members-popup';
  popup.innerHTML = `
    <div class="chat-members-head">
      <h4>Channel Members (${members.length})</h4>
      <button class="btn btn-ghost btn-sm chat-members-close">&times;</button>
    </div>
    <div class="chat-members-list">
      ${members.map(m => `
        <div class="chat-member-item" style="display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:8px">
            <img src="${m.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&size=28&background=6366f1&color=fff`}" class="chat-member-avatar" />
            <span class="chat-member-name">${escapeHtml(m.name)}</span>
            ${m.role === 'admin' ? '<span class="chat-member-role">Admin</span>' : ''}
          </div>
          <button class="btn btn-ghost btn-sm chat-remove-member-btn" data-member-id="${m.id}" title="Remove member" style="color:var(--red,#dc2626);padding:2px 6px;font-size:16px;line-height:1">&times;</button>
        </div>
      `).join('')}
    </div>
    <button class="btn btn-primary btn-sm" id="chat-add-member-btn" style="width:100%;margin-top:10px">
      + Add Members
    </button>`;

  document.getElementById('chat-main').appendChild(popup);
  popup.querySelector('.chat-members-close').addEventListener('click', () => popup.remove());

  // Remove member handlers
  popup.querySelectorAll('.chat-remove-member-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const memberId = btn.dataset.memberId;
      if (!confirm('Remove this member from the channel?')) return;
      try {
        await api.delete(`/chat/channels/${currentChannelId}/members/${memberId}`);
        showToast('Member removed', 'success');
        // Refresh channel to get updated members
        openChannel(currentChannelId);
      } catch (err) {
        showToast('Failed to remove member', 'error');
      }
    });
  });

  // Add members handler
  document.getElementById('chat-add-member-btn')?.addEventListener('click', async () => {
    try {
      const res = await api.get('/users/search?per_page=50');
      const allUsers = Array.isArray(res) ? res : (res.data || []);
      const existingIds = members.map(m => m.id);
      const available = allUsers.filter(u => !existingIds.includes(u.id));

      if (available.length === 0) {
        showToast('No more users to add', 'info');
        return;
      }

      // Replace popup content with user picker
      const listEl = popup.querySelector('.chat-members-list');
      listEl.innerHTML = `
        <div style="margin-bottom:8px;font-size:13px;color:var(--text2,#64748b)">Select users to add:</div>
        ${available.map(u => `
          <label style="display:flex;align-items:center;gap:8px;padding:4px 6px;cursor:pointer;font-size:13px;border-radius:4px" class="chat-add-member-opt">
            <input type="checkbox" value="${u.id}" class="chat-add-member-cb"/>
            <img src="${u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=24&background=6366f1&color=fff`}" style="width:22px;height:22px;border-radius:50%;object-fit:cover"/>
            ${escapeHtml(u.name)}
          </label>
        `).join('')}`;

      const addBtn = document.getElementById('chat-add-member-btn');
      addBtn.textContent = 'Confirm Add';
      addBtn.onclick = async () => {
        const selectedIds = [...popup.querySelectorAll('.chat-add-member-cb:checked')].map(cb => parseInt(cb.value));
        if (selectedIds.length === 0) {
          showToast('Select at least one user', 'error');
          return;
        }
        try {
          await api.post(`/chat/channels/${currentChannelId}/members`, { user_ids: selectedIds });
          showToast(`${selectedIds.length} member(s) added`, 'success');
          openChannel(currentChannelId);
        } catch (err) {
          showToast('Failed to add members', 'error');
        }
      };
    } catch (err) {
      showToast('Failed to load users', 'error');
    }
  });
}

// ── Polling ─────────────────────────────────────────────────────────────────

function startPolling(channelId) {
  pollInterval = setInterval(async () => {
    if (currentChannelId !== channelId) return stopPolling();
    try {
      const res = await api.get(`/chat/channels/${channelId}/messages`, { per_page: 10 });
      const messages = res.data || [];
      if (messages.length > 0 && messages[0].id !== lastMessageId) {
        // New messages — find ones we don't have
        const newMsgs = [];
        for (const msg of messages) {
          if (msg.id === lastMessageId) break;
          if (msg.user_id !== store.get('user')?.id) {
            newMsgs.unshift(msg);
          }
        }
        newMsgs.forEach(m => appendMessage(m));
      }
    } catch {}
  }, 5000);
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatMessageBody(text) {
  let html = escapeHtml(text);
  // @mentions
  html = html.replace(/@(\w+)/g, '<span class="chat-mention">@$1</span>');
  // URLs
  html = html.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  // Line breaks
  html = html.replace(/\n/g, '<br>');
  return html;
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h';
  return Math.floor(diff / 86400) + 'd';
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
