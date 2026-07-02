import { useState } from 'react';
import useSyncData from './hooks/useSyncData';
import TableCard from './components/TableCard';
import TableModal from './components/TableModal';
import BillModal from './components/BillModal';
import AdminPanel from './components/AdminPanel';
import './App.css';

export default function App() {
  const { tables, menu, loading, error, connected, setTables, setMenu, upsertTable, deleteTable, upsertMenu, deleteMenu } = useSyncData();
  const [activeModal, setActiveModal] = useState(null);
  const [billTable, setBillTable] = useState(null);

  const getTable = (id) => tables.find(t => t.id === id);

  const handleStart = (id) => {
    const now = new Date().toISOString();
    const table = getTable(id);
    upsertTable({ ...table, occupied: true, startTime: now, items: [] });
    setTables(tables.map(t =>
      t.id === id ? { ...t, occupied: true, startTime: now, items: [] } : t
    ));
  };

  const handleManage = (id) => {
    setActiveModal(id);
  };

  const handleUpdateItems = (id, items) => {
    const table = getTable(id);
    upsertTable({ ...table, items });
    setTables(tables.map(t =>
      t.id === id ? { ...t, items: items.filter(i => i.quantity > 0) } : t
    ));
  };

  const handleBill = (id) => {
    setBillTable(id);
  };

  const handleConfirmPayment = (id) => {
    const table = getTable(id);
    upsertTable({ ...table, occupied: false, startTime: null, items: [] });
    setTables(tables.map(t =>
      t.id === id ? { ...t, occupied: false, startTime: null, items: [] } : t
    ));
    setBillTable(null);
  };

  const handleEndSession = (id) => {
    setActiveModal(null);
    setBillTable(id);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Quản lý bàn Bida</h1>
        <div className="header-actions">
          {!connected && <span className="badge badge-warning">Offline</span>}
          {connected && <span className="badge badge-success">Online</span>}
          <button className="btn btn-secondary" onClick={() => setActiveModal('admin')}>
            ⚙ Quản lý
          </button>
        </div>
      </header>

      <main className="main">
        <div className="table-grid">
          {tables.map(table => (
            <TableCard
              key={table.id}
              table={table}
              onStart={handleStart}
              onManage={handleManage}
              onBill={handleBill}
            />
          ))}
        </div>
      </main>

      {activeModal && activeModal !== 'admin' && (
        <TableModal
          table={getTable(activeModal)}
          menu={menu}
          onClose={() => setActiveModal(null)}
          onUpdateItems={handleUpdateItems}
          onEndSession={handleEndSession}
        />
      )}

      {billTable && (
        <BillModal
          table={getTable(billTable)}
          menu={menu}
          items={getTable(billTable)?.items || []}
          onClose={() => setBillTable(null)}
          onConfirm={handleConfirmPayment}
        />
      )}

      {activeModal === 'admin' && (
        <AdminPanel
          tables={tables}
          menu={menu}
          onUpdateTables={(updated) => {
            const deleted = tables.filter(t => !updated.find(u => u.id === t.id));
            deleted.forEach(t => deleteTable(t.id));
            updated.forEach(t => upsertTable(t));
            setTables(updated);
          }}
          onUpdateMenu={(updated) => {
            const deleted = menu.filter(m => !updated.find(u => u.id === m.id));
            deleted.forEach(m => deleteMenu(m.id));
            updated.forEach(m => upsertMenu(m));
            setMenu(updated);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
