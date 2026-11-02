const STORAGE_PREFIX = 'indiAR_cart_' ;

function userId() {
  try {
    const user = JSON.parse(localStorage.getItem('indiAR_user') || 'null');
    return String(user?.id || user?.ID || 'guest');
  } catch (_) {
    return 'guest';
  }
}

function storageKey() { return `${STORAGE_PREFIX}${userId()}`; }

function readCart() {
  try {
    const items = JSON.parse(localStorage.getItem(storageKey()) || '[]');
    return Array.isArray(items) ? items : [];
  } catch (_) { return []; }
}

function writeCart(items) {
  localStorage.setItem(storageKey(), JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart-changed', { detail: { count: items.length } }));
}

function addToCart(game, platform) {
  const items = readCart();
  if (!items.some(item => String(item.ID) === String(game.ID))) {
    items.push({
      ID: game.ID,
      titulo: game.titulo,
      precio: game.precio_final ?? game.precio,
      precio_original: game.precio,
      oferta_activa: Boolean(game.oferta_activa),
      img_principal: game.img_principal || '',
      desarrollador: game.desarrollador || '',
      descripcion: game.descripcion || '',
      plataformas: game.plataformas || [],
      plataforma: platform,
    });
    writeCart(items);
  }
}

function updateCartPlatform(gameId, platform) {
  const items = readCart().map(item => String(item.ID) === String(gameId) ? { ...item, plataforma: platform } : item);
  writeCart(items);
}

function syncCartDetails(games) {
  const gamesById = new Map(games.map(game => [String(game.ID), game]));
  const items = readCart();
  const updatedItems = items.map(item => {
    const game = gamesById.get(String(item.ID));
    if (!game) return item;
    const platforms = game.plataformas || [];
    return {
      ...item,
      titulo: game.titulo,
      precio: game.precio_final ?? game.precio,
      precio_original: game.precio,
      oferta_activa: Boolean(game.oferta_activa),
      img_principal: game.img_principal || '',
      desarrollador: game.desarrollador || '',
      descripcion: game.descripcion || '',
      plataformas: platforms,
      plataforma: platforms.includes(item.plataforma) ? item.plataforma : '',
    };
  });
  if (JSON.stringify(items) !== JSON.stringify(updatedItems)) writeCart(updatedItems);
}

function removeFromCart(gameId) {
  writeCart(readCart().filter(item => String(item.ID) !== String(gameId)));
}

function clearCart() { writeCart([]); }
function cartCount() { return readCart().length; }
function isInCart(gameId) { return readCart().some(item => String(item.ID) === String(gameId)); }

export { readCart, addToCart, updateCartPlatform, syncCartDetails, removeFromCart, clearCart, cartCount, isInCart };
