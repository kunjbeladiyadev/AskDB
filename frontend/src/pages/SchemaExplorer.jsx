import React, { useState, useEffect } from 'react';
import { Database, Search, RefreshCw, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SchemaTree from '../components/ui/SchemaTree';
import toast from 'react-hot-toast';

const SchemaExplorer = () => {
  const { authenticatedFetch } = useAuth();
  
  const [schema, setSchema] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Local fallback mock schema (identical to backend definition)
  const FALLBACK_SCHEMA = {
    "regions": {
      "description": "Stores geographic regions and region managers",
      "columns": [
        {"name": "id", "type": "INT", "primary_key": true, "foreign_key": null},
        {"name": "name", "type": "VARCHAR(100)", "primary_key": false, "foreign_key": null},
        {"name": "manager", "type": "VARCHAR(100)", "primary_key": false, "foreign_key": null}
      ]
    },
    "customers": {
      "description": "Business customers details and region mappings",
      "columns": [
        {"name": "id", "type": "INT", "primary_key": true, "foreign_key": null},
        {"name": "name", "type": "VARCHAR(150)", "primary_key": false, "foreign_key": null},
        {"name": "email", "type": "VARCHAR(150)", "primary_key": false, "foreign_key": null},
        {"name": "region_id", "type": "INT", "primary_key": false, "foreign_key": "regions.id"},
        {"name": "created_at", "type": "TIMESTAMP", "primary_key": false, "foreign_key": null}
      ]
    },
    "orders": {
      "description": "Customer purchase orders and transactions",
      "columns": [
        {"name": "id", "type": "INT", "primary_key": true, "foreign_key": null},
        {"name": "customer_id", "type": "INT", "primary_key": false, "foreign_key": "customers.id"},
        {"name": "total_amount", "type": "DECIMAL(10,2)", "primary_key": false, "foreign_key": null},
        {"name": "order_date", "type": "DATE", "primary_key": false, "foreign_key": null}
      ]
    },
    "products": {
      "description": "Product inventory, pricing and category groups",
      "columns": [
        {"name": "id", "type": "INT", "primary_key": true, "foreign_key": null},
        {"name": "name", "type": "VARCHAR(150)", "primary_key": false, "foreign_key": null},
        {"name": "price", "type": "DECIMAL(10,2)", "primary_key": false, "foreign_key": null},
        {"name": "category", "type": "VARCHAR(100)", "primary_key": false, "foreign_key": null}
      ]
    },
    "sales": {
      "description": "Detailed items sold breakdown mapping orders to products",
      "columns": [
        {"name": "id", "type": "INT", "primary_key": true, "foreign_key": null},
        {"name": "order_id", "type": "INT", "primary_key": false, "foreign_key": "orders.id"},
        {"name": "product_id", "type": "INT", "primary_key": false, "foreign_key": "products.id"},
        {"name": "quantity", "type": "INT", "primary_key": false, "foreign_key": null},
        {"name": "amount", "type": "DECIMAL(10,2)", "primary_key": false, "foreign_key": null}
      ]
    }
  };

  const fetchSchema = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch('/database/schema');
      const data = await response.json();
      if (response.ok) {
        setSchema(data);
      } else {
        throw new Error();
      }
    } catch (err) {
      console.warn('Backend schema API unreachable. Falling back to static definitions.');
      setSchema(FALLBACK_SCHEMA);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, []);

  // Filter schema by search query
  const getFilteredSchema = () => {
    if (!schema) return null;
    if (!searchQuery.trim()) return schema;

    const filtered = {};
    const query = searchQuery.toLowerCase();

    Object.entries(schema).forEach(([tableName, tableDetails]) => {
      const matchTable = tableName.toLowerCase().includes(query);
      const matchDesc = tableDetails.description?.toLowerCase().includes(query);
      const matchingCols = tableDetails.columns.filter(col => col.name.toLowerCase().includes(query));

      if (matchTable || matchDesc || matchingCols.length > 0) {
        filtered[tableName] = {
          ...tableDetails,
          // If the table name itself matched, show all columns, otherwise show matching columns
          columns: matchTable ? tableDetails.columns : matchingCols
        };
      }
    });

    return filtered;
  };

  const filteredSchema = getFilteredSchema();

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-200 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-light-border dark:border-dark-border pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Schema Explorer
            </h1>
            <p className="text-sm text-light-muted dark:text-dark-muted">
              Inspect database tables, column keys, references, and descriptions
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex items-center flex-1 sm:flex-initial">
              <div className="absolute left-3 text-light-muted dark:text-dark-muted">
                <Search size={14} />
              </div>
              <input
                type="text"
                placeholder="Search tables or columns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg text-xs w-full sm:w-60 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchSchema} className="!p-2 rounded-lg">
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>

        {/* Explorer tree */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl">
            <SchemaTree schema={filteredSchema} />
          </div>
        )}
      </main>
    </div>
  );
};

export default SchemaExplorer;
