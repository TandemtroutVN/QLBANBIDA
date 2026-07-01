import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DEFAULT_TABLES, DEFAULT_MENU } from './data/defaults';
import TableCard from './components/TableCard';
import TableModal from './components/TableModal';
import BillModal from './components/BillModal';
import AdminPanel from './components/AdminPanel';
import './App.css';

export default function App() {
  const [tables, setTables] = useLocalStorage('qlbida_tables', DEFAULT_TABLES);
  const [menu, setMenu] = useLocalStorage('qlbida_menu', DEFAULT_MENU);
  const [activeModal, setActiveModal] = useState(null);
  const [billTable, setBillTable] = useState(null);

  const getTable = (id) => tables.find(t => t.id === id);

  const handleStart = (id) => {
    setTables(tables.map(t =>
      t.id === id ? { ...t, occupied: true, startTime: new Date().toISOString(), items: [] } : t
    ));
  };

  const handleManage = (id) => {
    setActiveModal(id);
  };

  const handleUpdateItems = (id, items) => {
    setTables(tables.map(t =>
      t.id === id ? { ...t, items: items.filter(i => i.quantity > 0) } : t
    ));
  };

  const handleBill = (id) => {
    setBillTable(id);
  };

  const handleConfirmPayment = (id) => {
    setTables(tables.map(t =>
      t.id === id ? { ...t, occupied: false, startTime: null, items: [] } : t
    ));
    setBillTable(null);
  };

  const handleEndSession = (id) => {
    setActiveModal(null);
    setBillTable(id);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Quản lý bàn Bida</h1>
        <div className="header-actions">
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
          onUpdateTables={setTables}
          onUpdateMenu={setMenu}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
