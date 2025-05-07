"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash, RotateCcw, Settings, X } from "lucide-react";
import dynamic from "next/dynamic";

// Import the wheel component with dynamic import to avoid SSR issues
const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  { ssr: false }
);

// Default text entries for the roulette
const DEFAULT_ENTRIES = [
  "Prize 1",
  "Prize 2",
  "Prize 3",
];

// Default colors for the wheel segments
const COLORS = [
  "#F59E0B", // amber-500
  "#1E293B", // slate-800
  "#D97706", // amber-600
  "#334155", // slate-700
  "#F59E0B", // amber-500
  "#1E293B", // slate-800
  "#D97706", // amber-600
  "#334155", // slate-700
];

export default function RouletteGame() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [presetWinner, setPresetWinner] = useState<number | null>(null);
  const [spinDuration, setSpinDuration] = useState(1); // in seconds
  const [showConfetti, setShowConfetti] = useState(false);
  const [entries, setEntries] = useState(DEFAULT_ENTRIES);
  const [newEntry, setNewEntry] = useState("");
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);

  // Format data for the wheel
  const wheelData = entries.map((entry, index) => ({
    option: entry,
    style: {
      backgroundColor: COLORS[index % COLORS.length],
      textColor: "white",
    },
  }));

  // Secret key combination for admin access (Ctrl+Shift+A)
  const [keysPressed, setKeysPressed] = useState({
    ctrl: false,
    shift: false,
    a: false,
  });

  const correctPassword = "admin123"; // In a real app, this would be securely stored

  useEffect(() => {
    // Load saved entries from localStorage if available
    const savedEntries = localStorage.getItem("rouletteEntries");
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }

    // Add key event listeners for the secret admin combination
    const handleKeyDown = (e) => {
      if (e.key === "Control")
        setKeysPressed((prev) => ({ ...prev, ctrl: true }));
      if (e.key === "Shift")
        setKeysPressed((prev) => ({ ...prev, shift: true }));
      if (e.key === "a" || e.key === "A")
        setKeysPressed((prev) => ({ ...prev, a: true }));

      // Check if all keys are pressed
      if (
        keysPressed.ctrl &&
        keysPressed.shift &&
        (e.key === "a" || e.key === "A")
      ) {
        setAdminDialogOpen(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "Control")
        setKeysPressed((prev) => ({ ...prev, ctrl: false }));
      if (e.key === "Shift")
        setKeysPressed((prev) => ({ ...prev, shift: false }));
      if (e.key === "a" || e.key === "A")
        setKeysPressed((prev) => ({ ...prev, a: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keysPressed]);

  const saveEntries = useCallback((updatedEntries) => {
    setEntries(updatedEntries);
    localStorage.setItem("rouletteEntries", JSON.stringify(updatedEntries));
  }, []);

  const handleSpin = () => {
    if (mustSpin || entries.length === 0) return;

    // Determine the winning index
    let winningIndex;

    if (
      isAdminAuthenticated &&
      presetWinner !== null &&
      presetWinner < entries.length
    ) {
      winningIndex = presetWinner;
    } else {
      // Random result if no preset or not in admin mode
      winningIndex = Math.floor(Math.random() * entries.length);
    }

    setPrizeNumber(winningIndex);
    setMustSpin(true);
    setResult(null);
    setShowConfetti(true);
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setResult(entries[prizeNumber]);
    setShowConfetti(true);
  };

  const handleAdminLogin = () => {
    if (adminPassword === correctPassword) {
      setIsAdminAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminPassword("");
    setPresetWinner(null);
  };

  const updateEntry = (index, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = value;
    saveEntries(updatedEntries);
  };

  const addEntry = () => {
    if (newEntry.trim() !== "") {
      const updatedEntries = [...entries, newEntry.trim()];
      saveEntries(updatedEntries);
      setNewEntry("");
    }
  };

  const removeEntry = (index) => {
    if (entries.length <= 1) {
      alert("You need at least one entry in the wheel");
      return;
    }

    const updatedEntries = entries.filter((_, i) => i !== index);
    saveEntries(updatedEntries);

    // Update preset winner if it's affected
    if (presetWinner !== null) {
      if (presetWinner === index) {
        setPresetWinner(null);
      } else if (presetWinner > index) {
        setPresetWinner(presetWinner - 1);
      }
    }
  };

  const resetToDefault = () => {
    if (
      confirm(
        "Reset to default entries? This will remove all your custom entries."
      )
    ) {
      saveEntries(DEFAULT_ENTRIES);
      setPresetWinner(null);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {/* Left panel - only on desktop */}
        <Card className="hidden md:block bg-slate-800 border-slate-700">
          <CardHeader className="mb-4">
            <CardTitle className="text-slate-200">Wheel Entries</CardTitle>
            <CardDescription className="text-slate-400">
              Customize your wheel content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                {entries.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={entry}
                      onChange={(e) => updateEntry(index, e.target.value)}
                      placeholder={`Entry ${index + 1}`}
                      className="bg-slate-700 border-slate-600 text-slate-200"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEntry(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Input
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  placeholder="New entry"
                  className="bg-slate-700 border-slate-600 text-slate-200"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addEntry();
                    }
                  }}
                />
                <Button variant="outline" size="icon" onClick={addEntry}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefault}
                className="w-full mt-4"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Center panel - Wheel */}
        <div className="md:col-span-2 flex flex-col items-center">
          <Card className="bg-slate-800 border-slate-700 w-full">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="relative mb-8">
                {/* Using the react-custom-roulette Wheel component */}
                <div className="flex justify-center">
                  {wheelData.length > 0 && (
                    <Wheel
                      mustStartSpinning={mustSpin}
                      prizeNumber={prizeNumber}
                      data={wheelData}
                      onStopSpinning={handleStopSpinning}
                      spinDuration={spinDuration}
                      backgroundColors={COLORS}
                      textColors={["#FFFFFF"]}
                      fontSize={14}
                      fontWeight={600}
                      outerBorderColor="#F59E0B"
                      outerBorderWidth={8}
                      innerBorderColor="#F59E0B"
                      innerBorderWidth={5}
                      radiusLineColor="#F59E0B"
                      radiusLineWidth={2}
                      perpendicularText
                      textDistance={60}
                    />
                  )}
                </div>

                {showConfetti && result !== null && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="text-4xl animate-bounce">🎉</div>
                  </div>
                )}
              </div>

              {result !== null && (
                <div className="mb-6 text-center w-full max-w-md">
                  <Card className="bg-gradient-to-r from-amber-500 to-yellow-500 border-none">
                    <CardContent className="p-4">
                      <h2 className="text-2xl font-bold text-white">
                        Result: <span className="text-3xl">{result}</span>
                      </h2>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="flex gap-4 mb-4 w-full justify-center">
                <Button
                  onClick={handleSpin}
                  disabled={mustSpin || entries.length === 0}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-8 py-6 text-xl border-none"
                >
                  {mustSpin ? "Spinning..." : "SPIN"}
                </Button>

                {/* Mobile only settings button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-y-auto bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-slate-200">
                        Wheel Entries
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                        {entries.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={entry}
                              onChange={(e) =>
                                updateEntry(index, e.target.value)
                              }
                              placeholder={`Entry ${index + 1}`}
                              className="bg-slate-700 border-slate-600 text-slate-200"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeEntry(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          value={newEntry}
                          onChange={(e) => setNewEntry(e.target.value)}
                          placeholder="New entry"
                          className="bg-slate-700 border-slate-600 text-slate-200"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addEntry();
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={addEntry}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetToDefault}
                        className="w-full mt-4"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset to Default
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden Admin Dialog - only shown with key combination Ctrl+Shift+A */}
      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-200 flex justify-between items-center">
              <span>Admin Access</span>
            </DialogTitle>
          </DialogHeader>

          {!isAdminAuthenticated ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-password">Admin Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-slate-700 border-slate-600 text-slate-200"
                />
              </div>
              <Button onClick={handleAdminLogin} className="w-full">
                Login
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preset-winner">Preset Winner</Label>
                <select
                  id="preset-winner"
                  className="w-full p-2 border rounded-md bg-slate-700 border-slate-600 text-slate-200"
                  value={presetWinner === null ? "" : presetWinner}
                  onChange={(e) =>
                    setPresetWinner(
                      e.target.value ? Number.parseInt(e.target.value) : null
                    )
                  }
                >
                  <option value="">Random (no preset)</option>
                  {entries.map((entry, index) => (
                    <option key={index} value={index}>
                      {entry}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="spin-duration">Spin Duration (seconds)</Label>
                <Input
                  id="spin-duration"
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  value={spinDuration}
                  onChange={(e) =>
                    setSpinDuration(Number.parseFloat(e.target.value))
                  }
                  className="bg-slate-700 border-slate-600 text-slate-200"
                />
              </div>

              <Button
                onClick={handleAdminLogout}
                variant="destructive"
                className="w-full mt-4"
              >
                Logout
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
