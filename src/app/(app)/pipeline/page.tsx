"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Plus, GripVertical, Phone, Mail, Pencil, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { pipelineApi, dealsApi } from "@/lib/api";

interface Deal {
  id: string;
  title: string;
  value: string | number;
  expectedClose: string | null;
  stageId: string | null;
  status: string;
}

interface Stage {
  id: string;
  name: string;
  color: string | null;
  position: number;
}

function isOverdue(dateStr: string | null) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export default function PipelinePage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [stagesData, dealsData] = await Promise.all([
          pipelineApi.stages(),
          dealsApi.list(1, 200),
        ]);
        setStages(stagesData || []);
        setDeals(dealsData || []);
      } catch {
        // empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDragStart = (dealId: string) => {
    setDraggedDealId(dealId);
  };

  const handleDrop = async (stageId: string) => {
    if (!draggedDealId) return;
    const prev = deals.find((d) => d.id === draggedDealId);
    if (prev?.stageId === stageId) { setDraggedDealId(null); return; }

    setDeals((p) =>
      p.map((d) => (d.id === draggedDealId ? { ...d, stageId } : d))
    );
    setDraggedDealId(null);

    try {
      await dealsApi.update(draggedDealId, { stageId });
    } catch {
      // revert on error
      if (prev) setDeals((p) => p.map((d) => (d.id === prev.id ? prev : d)));
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalValue = deals.reduce((s, d) => s + Number(d.value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {deals.length} deals · {formatCurrency(totalValue)} total value
          </p>
        </div>
        <Button size="sm">
          <Plus size={16} />
          Add Deal
        </Button>
      </div>

      {stages.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No pipeline stages configured yet.</p>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageDeals = deals.filter((d) => d.stageId === stage.id);
            const stageValue = stageDeals.reduce((s, d) => s + Number(d.value || 0), 0);

            return (
              <div
                key={stage.id}
                className="flex w-72 shrink-0 flex-col"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(stage.id)}
              >
                {/* Column Header */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: stage.color || "#6366f1" }}
                    />
                    <span className="text-sm font-semibold">{stage.name}</span>
                    <Badge variant="secondary">{stageDeals.length}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(stageValue)}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-1 flex-col gap-2 rounded-(--radius-lg) bg-muted/50 p-2">
                  {stageDeals.map((deal) => (
                    <Card
                      key={deal.id}
                      draggable
                      onDragStart={() => handleDragStart(deal.id)}
                      className="cursor-grab p-3 active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium leading-tight">{deal.title}</p>
                        <GripVertical size={14} className="shrink-0 text-muted-foreground" />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <Badge variant="default">{formatCurrency(Number(deal.value || 0))}</Badge>
                        {deal.expectedClose && (
                          <span
                            className={`text-xs ${
                              isOverdue(deal.expectedClose)
                                ? "font-medium text-destructive"
                                : "text-muted-foreground"
                            }`}
                          >
                            {new Date(deal.expectedClose).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}

                  <button className="flex items-center justify-center gap-1 rounded-(--radius-md) border border-dashed border-border p-2 text-xs text-muted-foreground hover:bg-accent">
                    <Plus size={14} />
                    Add Deal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
