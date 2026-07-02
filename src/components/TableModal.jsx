import { useState, useEffect } from 'react';
import MenuPanel from './MenuPanel';
import { formatCurrency, calculateHours, formatTime, formatElapsed, roundTotal } from '../utils/format';

export default function TableModal({ table, menu, onClose, onUpdateItems, onEndSession }) {
  const [items, setItems] = useState([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setItems(table.items ? [...table.items] : []);
  }, [table]);

  useEffect(() => {
    if (!table.occupied) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [table.occupied]);

  const handleAddItem = (itemId) => {
    setItems(prev => {
      const exist = prev.find(i => i.id === itemId);
      if (exist) return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i);
      const menuItem = menu.find(m => m.id === itemId);
      return [...prev, { id: itemId, name: menuItem.name, price: menuItem.price, quantity: 1 }];
    });
  };

  const handleRemoveItem = (itemId) => {
    setItems(prev => {
      const exist = prev.find(i => i.id === itemId);
      if (exist.quantity <= 1) return prev.filter(i => i.id !== itemId);
      return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const handleSetQuantity = (itemId, quantity) => {
    setItems(prev => {
      if (quantity <= 0) return prev.filter(i => i.id !== itemId);
      const exist = prev.find(i => i.id === itemId);
      if (exist) return prev.map(i => i.id === itemId ? { ...i, quantity } : i);
      const menuItem = menu.find(m => m.id === itemId);
      return [...prev, { id: itemId, name: menuItem.name, price: menuItem.price, quantity }];
    });
  };

  const handleSave = () => {
    onUpdateItems(table.id, items);
    onClose();
  };

  const handleEndSession = () => {
    onUpdateItems(table.id, items);
    onEndSession(table.id);
  };

  const hours = table.startTime ? calculateHours(table.startTime) : 0;
  const tableCost = hours * table.hourlyRate;
  const itemCost = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = tableCost + itemCost;
  const roundedTotal = roundTotal(total);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{table.name} - {table.type}</h2>
          <button className="btn btn-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {table.occupied && (
            <div className="session-info">
              <p>Bắt đầu: {formatTime(table.startTime)}</p>
              <p className="elapsed-time">{formatElapsed(table.startTime)}</p>
              <p>Tiền bàn: {formatCurrency(tableCost)}</p>
            </div>
          )}
          <MenuPanel menu={menu} selectedItems={items} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} onSetQuantity={handleSetQuantity} />
          {items.length > 0 && (
            <div className="current-items">
              <h3>Món đã gọi</h3>
              {items.filter(i => i.quantity > 0).map(item => (
                <div key={item.id} className="current-item">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="current-item total-line">
                <span>Tạm tính</span>
                <span>{formatCurrency(roundedTotal)}</span>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
          <button className="btn btn-primary" onClick={handleSave}>Lưu món</button>
          {table.occupied && (
            <button className="btn btn-danger" onClick={handleEndSession}>Tính tiền & kết thúc</button>
          )}
        </div>
      </div>
    </div>
  );
}
