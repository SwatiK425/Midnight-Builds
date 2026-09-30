/**
 * BYOK Modal Module
 * Handles the Attach LLM Key modal dialog
 */

export function createByokModal() {
  // Modal already in HTML, this just initializes it
  const modal = document.getElementById('byok-modal');
  const closeBtn = document.getElementById('byok-close');
  const attachBtn = document.getElementById('byok-attach');
  const clearBtn = document.getElementById('byok-clear');
  const keyInput = document.getElementById('byok-key');
  const toggleBtn = document.getElementById('byok-toggle');
  const providerSelect = document.getElementById('byok-provider');
  const modelInput = document.getElementById('byok-model');
  const statusDiv = document.getElementById('byok-status');
  
  let onAttachCallback = null;
  let onClearCallback = null;
  
  function openModal() {
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('visible'));
    document.body.style.overflow = 'hidden';
    // Focus first input
    setTimeout(() => keyInput.focus(), 100);
  }
  
  function closeModal() {
    modal.classList.remove('visible');
    setTimeout(() => {
      modal.hidden = true;
      document.body.style.overflow = '';
    }, 200);
  }
  
  function showStatus(html, type = 'neutral') {
    statusDiv.hidden = false;
    statusDiv.className = `key-status key-status--${type}`;
    statusDiv.innerHTML = html;
  }
  
  function hideStatus() {
    statusDiv.hidden = true;
  }
  
  function setLoading(loading) {
    attachBtn.disabled = loading;
    if (loading) {
      attachBtn.classList.add('loading');
      attachBtn.querySelector('.btn-text').textContent = 'Attaching…';
    } else {
      attachBtn.classList.remove('loading');
      attachBtn.querySelector('.btn-text').textContent = 'Attach Key';
    }
  }
  
  function updateKeyUI(hasKey, info = null) {
    if (hasKey && info) {
      keyInput.value = '';
      providerSelect.value = info.provider || 'google';
      modelInput.value = info.model || '';
      attachBtn.hidden = true;
      clearBtn.hidden = false;
      showStatus(`<strong>✅ LLM Judge attached</strong><br>Provider: ${info.provider}<br>Model: ${info.model}<br>Key: ${info.maskedKey}<br><small>Rate budget: ${info.rateLimit?.remaining ?? '?'}/${info.rateLimit?.limit ?? '?'} remaining</small>`, 'success');
    } else {
      attachBtn.hidden = false;
      clearBtn.hidden = true;
      hideStatus();
    }
  }
  
  // Event listeners
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  toggleBtn.addEventListener('click', () => {
    const type = keyInput.type === 'password' ? 'text' : 'password';
    keyInput.type = type;
    toggleBtn.textContent = type === 'password' ? '👁' : '🙈';
  });
  
  attachBtn.addEventListener('click', async () => {
    const provider = providerSelect.value;
    const key = keyInput.value.trim();
    const model = modelInput.value.trim();
    
    if (!key) {
      showStatus('<strong>❌ No key entered.</strong> Paste your API key for the selected provider.', 'error');
      return;
    }
    
    setLoading(true);
    hideStatus();
    
    try {
      if (onAttachCallback) {
        const result = await onAttachCallback(provider, key, model);
        if (result.success) {
          updateKeyUI(true, { provider: result.provider, model: result.model, maskedKey: key.slice(0,4)+'…'+key.slice(-4), rateLimit: {} });
        } else {
          showStatus(result.html, 'error');
        }
      }
    } finally {
      setLoading(false);
    }
  });
  
  clearBtn.addEventListener('click', async () => {
    clearBtn.disabled = true;
    clearBtn.textContent = 'Clearing…';
    
    try {
      if (onClearCallback) {
        const result = await onClearCallback();
        if (result.success) {
          updateKeyUI(false);
        } else {
          showStatus(result.html, 'error');
        }
      }
    } finally {
      clearBtn.disabled = false;
      clearBtn.textContent = 'Clear Key';
    }
  });
  
  // Keyboard: Escape to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });
  
  // Public API
  return {
    open: openModal,
    close: closeModal,
    updateKeyUI,
    onAttach: (callback) => { onAttachCallback = callback; },
    onClear: (callback) => { onClearCallback = callback; }
  };
}