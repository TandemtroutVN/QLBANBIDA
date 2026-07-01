import { useState, useRef } from 'react';
import { formatCurrency } from '../utils/format';
import { TABLE_TYPES } from '../data/defaults';

export default function AdminPanel({ tables, menu, onUpdateTables, onUpdateMenu, onClose }) {
  const [activeTab, setActiveTab] = useState('tables');
  const [editingTable, setEditingTable] = useState(null);
  const [editingMenu, setEditingMenu] = useState(null);
  const fileRef = useRef(null);

  const handleExport = () => {
    const data = { tables, menu };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qlbida_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.tables) onUpdateTables(data.tables);
        if (data.menu) onUpdateMenu(data.menu);
        alert('Nhập dữ liệu thành công!');
      } catch {
        alert('File JSON không hợp lệ.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveTable = (table) => {
    if (table.id) {
      onUpdateTables(tables.map(t => t.id === table.id ? table : t));
    } else {
      const newId = Math.max(...tables.map(t => t.id), 0) + 1;
      onUpdateTables([...tables, { ...table, id: newId, occupied: false, startTime: null, items: [] }]);
    }
    setEditingTable(null);
  };

  const handleDeleteTable = (id) => {
    if (window.confirm('Xóa bàn này?')) {
      onUpdateTables(tables.filter(t => t.id !== id));
    }
  };

  const handleSaveMenu = (item) => {
    if (item.id) {
      onUpdateMenu(menu.map(m => m.id === item.id ? item : m));
    } else {
      const prefix = item.category === 'drink' ? 'd' : 'f';
      const existingIds = menu.filter(m => m.id.startsWith(prefix)).map(m => Number(m.id.slice(1)));
      const nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
      onUpdateMenu([...menu, { ...item, id: `${prefix}${nextNum}` }]);
    }
    setEditingMenu(null);
  };

  const handleDeleteMenu = (id) => {
    if (window.confirm('Xóa món này?')) {
      onUpdateMenu(menu.filter(m => m.id !== id));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal admin-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Quản lý</h2>
          <button className="btn btn-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="admin-actions">
            <input type="file" accept=".json" ref={fileRef} onChange={handleImport} style={{ display: 'none' }} />
            <button className="btn btn-sm btn-secondary" onClick={() => fileRef.current.click()}>📥 Nhập</button>
            <button className="btn btn-sm btn-secondary" onClick={handleExport}>📤 Xuất</button>
          </div>
          <div className="admin-tabs">
            <button className={`tab ${activeTab === 'tables' ? 'active' : ''}`} onClick={() => setActiveTab('tables')}>Bàn</button>
            <button className={`tab ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>Thực đơn</button>
          </div>

          {activeTab === 'tables' && (
            <div className="admin-section">
              <div className="admin-list">
                {tables.map(table => (
                  <div key={table.id} className="admin-item">
                    <span>{table.name} - {table.type} - {formatCurrency(table.hourlyRate)}/h</span>
                    <div>
                      <button className="btn btn-xs btn-primary" onClick={() => setEditingTable({ ...table })}>Sửa</button>
                      <button className="btn btn-xs btn-danger" onClick={() => handleDeleteTable(table.id)}>Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" onClick={() => setEditingTable({ name: '', type: 'Bida lỗ', hourlyRate: 50000 })}>+ Thêm bàn</button>

              {editingTable !== null && (
                <TableForm key={editingTable.id || 'new-table'} table={editingTable} onSave={handleSaveTable} onCancel={() => setEditingTable(null)} />
              )}
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="admin-section">
              <div className="admin-list">
                {menu.map(item => (
                  <div key={item.id} className="admin-item">
                    <span>{item.name} - {item.category === 'drink' ? 'Đồ uống' : 'Đồ ăn'} - {formatCurrency(item.price)}</span>
                    <div>
                      <button className="btn btn-xs btn-primary" onClick={() => setEditingMenu({ ...item })}>Sửa</button>
                      <button className="btn btn-xs btn-danger" onClick={() => handleDeleteMenu(item.id)}>Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" onClick={() => setEditingMenu({ name: '', category: 'drink', price: 10000 })}>+ Thêm món</button>

              {editingMenu !== null && (
                <MenuForm key={editingMenu.id || 'new-menu'} item={editingMenu} onSave={handleSaveMenu} onCancel={() => setEditingMenu(null)} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TableForm({ table, onSave, onCancel }) {
  const [name, setName] = useState(table.name || '');
  const [type, setType] = useState(table.type || 'Bida lỗ');
  const [rate, setRate] = useState(table.hourlyRate || 50000);

  return (
    <div className="admin-form">
      <input type="text" placeholder="Tên bàn" value={name} onChange={e => setName(e.target.value)} />
      <select value={type} onChange={e => setType(e.target.value)}>
        {TABLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <input type="number" placeholder="Giá giờ" value={rate} onChange={e => setRate(Number(e.target.value))} />
      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onCancel}>Hủy</button>
        <button className="btn btn-success" onClick={() => onSave({ ...table, name, type, hourlyRate: rate })}>Lưu</button>
      </div>
    </div>
  );
}

function MenuForm({ item, onSave, onCancel }) {
  const [name, setName] = useState(item.name || '');
  const [category, setCategory] = useState(item.category || 'drink');
  const [price, setPrice] = useState(item.price || 10000);

  return (
    <div className="admin-form">
      <input type="text" placeholder="Tên món" value={name} onChange={e => setName(e.target.value)} />
      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="drink">Đồ uống</option>
        <option value="food">Đồ ăn</option>
      </select>
      <input type="number" placeholder="Giá" value={price} onChange={e => setPrice(Number(e.target.value))} />
      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onCancel}>Hủy</button>
        <button className="btn btn-success" onClick={() => onSave({ ...item, name, category, price })}>Lưu</button>
      </div>
    </div>
  );
}
