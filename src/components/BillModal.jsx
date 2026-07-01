import { useState, useEffect } from 'react';
import { formatCurrency, calculateHours, formatTime, roundTotal } from '../utils/format';

export default function BillModal({ table, menu, items, onClose, onConfirm }) {
  const [now, setNow] = useState(Date.now());
  const hours = table.startTime ? calculateHours(table.startTime) : 0;
  const tableCost = hours * table.hourlyRate;
  const drinkItems = items.filter(item => {
    const m = menu.find(m => m.id === item.id);
    return m && m.category === 'drink';
  });
  const foodItems = items.filter(item => {
    const m = menu.find(m => m.id === item.id);
    return m && m.category === 'food';
  });
  const drinkTotal = drinkItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const foodTotal = foodItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const grandTotal = tableCost + drinkTotal + foodTotal;
  const roundedTotal = roundTotal(grandTotal);

  useEffect(() => {
    if (!table.occupied) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [table.occupied]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal bill-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>HÓA ĐƠN</h2>
          <button className="btn btn-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="bill-table-info">
            <h3>{table.name} - {table.type}</h3>
            <p>Giờ bắt đầu: {formatTime(table.startTime)}</p>
            <p>Thời gian chơi: {hours.toFixed(1)} giờ</p>
          </div>

          <div className="bill-section">
            <h4>1. Tiền bàn</h4>
            <div className="bill-row">
              <span>{hours.toFixed(1)} giờ x {formatCurrency(table.hourlyRate)}</span>
              <span>{formatCurrency(tableCost)}</span>
            </div>
          </div>

          {drinkItems.length > 0 && (
            <div className="bill-section">
              <h4>2. Tiền nước</h4>
              {drinkItems.map(item => (
                <div key={item.id} className="bill-row">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="bill-row bill-subtotal">
                <span>Cộng</span>
                <span>{formatCurrency(drinkTotal)}</span>
              </div>
            </div>
          )}

          {foodItems.length > 0 && (
            <div className="bill-section">
              <h4>3. Tiền đồ ăn</h4>
              {foodItems.map(item => (
                <div key={item.id} className="bill-row">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="bill-row bill-subtotal">
                <span>Cộng</span>
                <span>{formatCurrency(foodTotal)}</span>
              </div>
            </div>
          )}

          <div className="bill-row">
              <span>Làm tròn</span>
              <span>{formatCurrency(roundedTotal)}</span>
            </div>
            <div className="bill-total">
            <div className="bill-row">
              <span>Tiền bàn</span>
              <span>{formatCurrency(tableCost)}</span>
            </div>
            <div className="bill-row">
              <span>Tiền nước</span>
              <span>{formatCurrency(drinkTotal)}</span>
            </div>
            <div className="bill-row">
              <span>Tiền đồ ăn</span>
              <span>{formatCurrency(foodTotal)}</span>
            </div>
            <div className="bill-row grand-total">
              <span>TỔNG CỘNG</span>
              <span>{formatCurrency(roundedTotal)}</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
          <button className="btn btn-success" onClick={() => onConfirm(table.id)}>
            Xác nhận thanh toán - {formatCurrency(roundedTotal)}
          </button>
        </div>
      </div>
    </div>
  );
}
