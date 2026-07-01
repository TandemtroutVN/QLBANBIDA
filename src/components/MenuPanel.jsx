import { formatCurrency } from '../utils/format';

export default function MenuPanel({ menu, selectedItems, onAddItem, onRemoveItem, onSetQuantity }) {
  const drinks = menu.filter(item => item.category === 'drink');
  const foods = menu.filter(item => item.category === 'food');
  const getQty = (id) => selectedItems.find(i => i.id === id)?.quantity || 0;

  return (
    <div className="menu-panel">
      <h3>Đồ uống</h3>
      <div className="menu-items">
        {drinks.map(item => (
          <div key={item.id} className="menu-item">
            <div className="menu-info">
              <span className="menu-name">{item.name}</span>
              <span className="menu-price">{formatCurrency(item.price)}</span>
            </div>
            <div className="menu-qty">
              <button className="btn btn-xs" onClick={() => onRemoveItem(item.id)} disabled={getQty(item.id) === 0}>-</button>
              <input type="number" className="qty-input" min="0" value={getQty(item.id)}
                onChange={e => onSetQuantity(item.id, Math.max(0, parseInt(e.target.value) || 0))} />
              <button className="btn btn-xs" onClick={() => onAddItem(item.id)}>+</button>
            </div>
          </div>
        ))}
      </div>
      <h3>Đồ ăn</h3>
      <div className="menu-items">
        {foods.map(item => (
          <div key={item.id} className="menu-item">
            <div className="menu-info">
              <span className="menu-name">{item.name}</span>
              <span className="menu-price">{formatCurrency(item.price)}</span>
            </div>
            <div className="menu-qty">
              <button className="btn btn-xs" onClick={() => onRemoveItem(item.id)} disabled={getQty(item.id) === 0}>-</button>
              <input type="number" className="qty-input" min="0" value={getQty(item.id)}
                onChange={e => onSetQuantity(item.id, Math.max(0, parseInt(e.target.value) || 0))} />
              <button className="btn btn-xs" onClick={() => onAddItem(item.id)}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
