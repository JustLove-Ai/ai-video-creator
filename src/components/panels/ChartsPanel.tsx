"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, BarChart3, PieChart, LineChart, TrendingUp, Plus, Trash2 } from "lucide-react";
import { Theme, ChartData } from "@/types";

interface ChartsPanelProps {
  onClose: () => void;
  onChartInsert: (chartData: ChartData) => void;
  currentTheme: Theme;
}

const CHART_TYPES = [
  { id: "bar", name: "Bar Chart", icon: BarChart3, description: "Compare values across categories" },
  { id: "pie", name: "Pie Chart", icon: PieChart, description: "Show proportions of a whole" },
  { id: "line", name: "Line Chart", icon: LineChart, description: "Display trends over time" },
  { id: "funnel", name: "Funnel Chart", icon: TrendingUp, description: "Show stages in a process" },
];

export function ChartsPanel({ onClose, onChartInsert, currentTheme }: ChartsPanelProps) {
  const [selectedType, setSelectedType] = useState<"bar" | "pie" | "line" | "funnel">("bar");
  const [chartTitle, setChartTitle] = useState("Chart Title");
  const [dataRows, setDataRows] = useState<{ label: string; value: string }[]>([
    { label: "Category 1", value: "10" },
    { label: "Category 2", value: "20" },
    { label: "Category 3", value: "30" },
  ]);
  const [datasetLabel, setDatasetLabel] = useState("Dataset 1");
  const [showLegend, setShowLegend] = useState(false);
  const [legendPosition, setLegendPosition] = useState<"top" | "bottom" | "left" | "right">("right");

  // Auto-insert chart on mount and when type changes
  useEffect(() => {
    const labels = dataRows.map(row => row.label);
    const values = dataRows.map(row => parseFloat(row.value)).filter(v => !isNaN(v));

    const chartData: ChartData = {
      type: selectedType,
      title: chartTitle,
      labels,
      datasets: [{
        label: datasetLabel,
        data: values,
        color: currentTheme.accent,
      }],
      showLegend,
      legendPosition,
    };

    onChartInsert(chartData);
  }, [selectedType]); // Only trigger on type change

  const handleAddRow = () => {
    setDataRows([...dataRows, { label: `Category ${dataRows.length + 1}`, value: "0" }]);
  };

  const handleRemoveRow = (index: number) => {
    if (dataRows.length > 1) {
      setDataRows(dataRows.filter((_, i) => i !== index));
    }
  };

  const handleRowChange = (index: number, field: "label" | "value", value: string) => {
    const newRows = [...dataRows];
    newRows[index][field] = value;
    setDataRows(newRows);
  };

  const handleApplyChanges = () => {
    const labels = dataRows.map(row => row.label);
    const values = dataRows.map(row => parseFloat(row.value)).filter(v => !isNaN(v));

    const chartData: ChartData = {
      type: selectedType,
      title: chartTitle,
      labels,
      datasets: [{
        label: datasetLabel,
        data: values,
        color: currentTheme.accent,
      }],
      showLegend,
      legendPosition,
    };

    onChartInsert(chartData);
  };

  return (
    <motion.div
      initial={{ x: 360 }}
      animate={{ x: 0 }}
      exit={{ x: 360 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed right-0 top-16 bottom-0 w-[360px] bg-card border-l border-border shadow-xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold">Chart Editor</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content with Tabs */}
      <Tabs defaultValue="type" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2 mx-4 mt-4 mb-2">
          <TabsTrigger value="type">Chart Type</TabsTrigger>
          <TabsTrigger value="details">Chart Details</TabsTrigger>
        </TabsList>

        {/* Chart Type Tab */}
        <TabsContent value="type" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              <Label className="text-sm font-medium">Select Chart Type</Label>
              <div className="grid gap-2">
                {CHART_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id as "bar" | "pie" | "line" | "funnel")}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedType === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${selectedType === type.id ? "text-primary" : "text-muted-foreground"}`} />
                        <div>
                          <div className="font-medium text-sm">{type.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{type.description}</div>
                        </div>
                        {selectedType === type.id && (
                          <div className="ml-auto">
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Chart Details Tab */}
        <TabsContent value="details" className="flex-1 m-0 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">

              {/* Chart Title */}
              <div>
                <Label htmlFor="chart-title" className="text-sm font-medium">Chart Title</Label>
                <Input
                  id="chart-title"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  placeholder="Enter chart title"
                  className="mt-2"
                />
              </div>

              {/* Dataset Label */}
              <div>
                <Label htmlFor="dataset-label" className="text-sm font-medium">Dataset Label</Label>
                <Input
                  id="dataset-label"
                  value={datasetLabel}
                  onChange={(e) => setDatasetLabel(e.target.value)}
                  placeholder="e.g., Sales, Revenue"
                  className="mt-2"
                />
              </div>

              {/* Data Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Data</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddRow}
                    className="gap-1 h-7 text-xs"
                  >
                    <Plus className="h-3 w-3" />
                    Add Row
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2 font-medium">Label</th>
                        <th className="text-left p-2 font-medium">Value</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataRows.map((row, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">
                            <Input
                              value={row.label}
                              onChange={(e) => handleRowChange(index, "label", e.target.value)}
                              placeholder={`Category ${index + 1}`}
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={row.value}
                              onChange={(e) => handleRowChange(index, "value", e.target.value)}
                              placeholder="0"
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="p-2">
                            {dataRows.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveRow(index)}
                                className="h-7 w-7"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Legend Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Legend</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show-legend"
                    checked={showLegend}
                    onChange={(e) => setShowLegend(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="show-legend" className="text-sm font-normal cursor-pointer">
                    Show Legend
                  </Label>
                </div>
                {showLegend && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Legend Position</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["top", "bottom", "left", "right"] as const).map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setLegendPosition(pos)}
                          className={`px-3 py-2 rounded-md border text-xs capitalize transition-colors ${
                            legendPosition === pos
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-muted-foreground/50"
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Apply Button */}
          <div className="p-4 border-t border-border">
            <Button onClick={handleApplyChanges} className="w-full">
              Apply Changes
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
