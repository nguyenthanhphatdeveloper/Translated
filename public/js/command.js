/**
 * Simple command palette
 * Commands:
 *  /ipa <word>  -> đi tới /ipa và tự động điền ô nhập (nếu có)
 *  /g <query>   -> mở /grammar với search
 *  /t <topic>   -> mở /learn với topic filter
 */
(function(){
  const palette = document.createElement('div');
  palette.innerHTML = `
    <div id="cmd-backdrop" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:9998;"></div>
    <div id="cmd-modal" style="display:none; position:fixed; inset:0; z-index:9999; pointer-events:none;">
      <div style="max-width:640px; margin:10% auto 0; background:white; border-radius:12px; box-shadow:0 20px 60px rgba(0,0,0,0.25); overflow:hidden; pointer-events:auto;">
        <input id="cmd-input" placeholder="Nhập /ipa hello, /g adjective, /t travel" 
          style="width:100%; padding:14px 16px; border:none; outline:none; font-size:14px;">
      </div>
    </div>
  `;
  document.body.appendChild(palette);

  const backdrop = document.getElementById('cmd-backdrop');
  const modal = document.getElementById('cmd-modal');
  const input = document.getElementById('cmd-input');

  function openPalette(){
    backdrop.style.display='block';
    modal.style.display='block';
    input.value='';
    input.focus();
  }
  function closePalette(){
    backdrop.style.display='none';
    modal.style.display='none';
  }

  function handleCommand(cmd){
    if(!cmd.trim()) return;
    if(cmd.startsWith('/ipa ')){
      const w = cmd.slice(5).trim();
      window.location.href = '/ipa#'+encodeURIComponent(w);
      return;
    }
    if(cmd.startsWith('/g ')){
      const q = cmd.slice(3).trim();
      window.location.href = '/grammar?search='+encodeURIComponent(q);
      return;
    }
    if(cmd.startsWith('/t ')){
      const t = cmd.slice(3).trim();
      window.location.href = '/learn?topic='+encodeURIComponent(t);
      return;
    }
    // fallback search to learn
    window.location.href = '/learn?search='+encodeURIComponent(cmd);
  }

  backdrop.addEventListener('click', closePalette);
  input.addEventListener('keydown', (e)=>{
    if(e.key==='Escape'){ closePalette(); }
    if(e.key==='Enter'){ handleCommand(input.value); closePalette(); }
  });

  window.addEventListener('keydown', (e)=>{
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k'){
      e.preventDefault();
      openPalette();
    }
  });

  // If opened with hash on IPA page, prefill input
  window.addEventListener('DOMContentLoaded', ()=>{
    if(window.location.pathname==='/ipa' && window.location.hash){
      const word = decodeURIComponent(window.location.hash.slice(1));
      const field = document.querySelector('input.answer') || document.querySelector('input[type="text"]');
      if(field) field.value = word;
    }
  });
})();

