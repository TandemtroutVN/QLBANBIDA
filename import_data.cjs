const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const data = {
  "tables": [
    { "id": 2, "name": "Bàn 1", "type": "Bida lỗ", "hourlyRate": 20000, "occupied": true, "startTime": "2026-07-01T15:56:49.003Z", "items": [] },
    { "id": 3, "name": "Bàn 2", "type": "Bida 3 băng", "hourlyRate": 20000, "occupied": false, "startTime": null, "items": [] },
    { "id": 4, "name": "Bàn 3", "type": "Bida 3 băng", "hourlyRate": 20000, "occupied": false, "startTime": null, "items": [] },
    { "id": 5, "name": "Bàn 4", "type": "Bida 3 băng", "hourlyRate": 20000, "occupied": false, "startTime": null, "items": [] },
    { "id": 6, "name": "Bàn 5", "type": "Bida 3 băng", "hourlyRate": 20000, "occupied": false, "startTime": null, "items": [] }
  ],
  "menu": [
    { "id": "d1", "name": "Bia Tiger Nhỏ", "category": "drink", "price": 15000 },
    { "id": "d2", "name": "Pepsi", "category": "drink", "price": 10000 },
    { "id": "d3", "name": "Sting", "category": "drink", "price": 10000 },
    { "id": "d4", "name": "Không độ", "category": "drink", "price": 10000 },
    { "id": "d5", "name": "Rivai", "category": "drink", "price": 10000 },
    { "id": "d6", "name": "Bò hút", "category": "drink", "price": 15000 },
    { "id": "d7", "name": "Rivai chanh muối", "category": "drink", "price": 10000 },
    { "id": "d8", "name": "Larue Smooth", "category": "drink", "price": 13000 },
    { "id": "f2", "name": "Mực khô", "category": "food", "price": 100000 },
    { "id": "f3", "name": "Trái Cây", "category": "food", "price": 20000 }
  ]
};

(async () => {
  for (const table of data.tables) {
    const { error } = await supabase.from('tables').upsert(table);
    if (error) console.error('Table error:', table.id, error.message);
    else console.log('OK table:', table.name);
  }
  for (const item of data.menu) {
    const { error } = await supabase.from('menu_items').upsert(item);
    if (error) console.error('Menu error:', item.id, error.message);
    else console.log('OK menu:', item.name);
  }
  console.log('Done!');
})();
