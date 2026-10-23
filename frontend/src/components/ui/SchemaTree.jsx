import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Table, Key, Link as LinkIcon, Info } from 'lucide-react';
import Card from './Card';
import Badge from './Badge';

const SchemaTree = ({ schema }) => {
  if (!schema || Object.keys(schema).length === 0) {
    return (
      <div className="text-center py-6 text-light-muted dark:text-dark-muted text-xs">
        No schema metadata loaded.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {Object.entries(schema).map(([tableName, tableDetails]) => (
        <TableNode key={tableName} name={tableName} details={tableDetails} />
      ))}
    </div>
  );
};

const TableNode = ({ name, details }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card variant="default" className="overflow-hidden">
      {/* Table Title Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-light-hover/30 dark:bg-dark-hover/10 hover:bg-light-hover/60 dark:hover:bg-dark-hover/20 transition-colors duration-200 outline-none text-left"
      >
        <div className="flex items-center gap-3">
          <div className="text-light-muted dark:text-dark-muted">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
          <div className="p-1.5 bg-accent-primary/10 rounded-lg text-accent-primary">
            <Table size={14} />
          </div>
          <div>
            <span className="font-bold text-sm text-light-text dark:text-dark-text">{name}</span>
            <span className="text-[10px] ml-2 font-medium text-accent-secondary bg-accent-secondary/5 px-2 py-0.5 rounded-full border border-accent-secondary/15">
              {details.columns.length} columns
            </span>
          </div>
        </div>
      </button>

      {/* Columns List */}
      {isOpen && (
        <div className="px-5 py-4 border-t border-light-border dark:border-dark-border bg-white/50 dark:bg-dark-card/20 space-y-3">
          {/* Table description */}
          {details.description && (
            <div className="flex gap-2 p-3 bg-light-hover/30 dark:bg-dark-hover/10 rounded-lg border border-light-border dark:border-dark-border text-xs text-light-muted dark:text-dark-muted leading-relaxed">
              <Info size={14} className="flex-shrink-0 mt-0.5 text-accent-primary" />
              <span>{details.description}</span>
            </div>
          )}

          {/* Table Header */}
          <div className="grid grid-cols-12 text-[10px] font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider border-b border-light-border dark:border-dark-border pb-1.5 px-1">
            <span className="col-span-5">Column Name</span>
            <span className="col-span-3">Data Type</span>
            <span className="col-span-4 text-right">Key Mappings</span>
          </div>

          {/* Table Columns */}
          <div className="space-y-1.5">
            {details.columns.map((col, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 text-xs items-center py-2 px-1 hover:bg-light-hover/40 dark:hover:bg-dark-hover/10 rounded transition-colors duration-150"
              >
                {/* Column Name */}
                <div className="col-span-5 flex items-center gap-2 font-mono font-medium text-light-text dark:text-dark-text">
                  {col.primary_key && <Key size={10} className="text-amber-500 flex-shrink-0" />}
                  {col.foreign_key && <LinkIcon size={10} className="text-accent-secondary flex-shrink-0" />}
                  {!col.primary_key && !col.foreign_key && <span className="w-2.5"></span>}
                  <span>{col.name}</span>
                </div>

                {/* Column Type */}
                <span className="col-span-3 font-mono text-[11px] text-light-muted dark:text-dark-muted">
                  {col.type}
                </span>

                {/* Key Status Indicators */}
                <div className="col-span-4 flex justify-end gap-1.5">
                  {col.primary_key && (
                    <Badge variant="warning" className="!px-1.5 !py-0 !text-[9px]">
                      PK
                    </Badge>
                  )}
                  {col.foreign_key && (
                    <Badge
                      variant="secondary"
                      className="!px-1.5 !py-0 !text-[9px]"
                      title={`References ${col.foreign_key}`}
                    >
                      FK
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default SchemaTree;
