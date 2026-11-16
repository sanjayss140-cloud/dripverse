import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  CloudSun,
  Star
} from 'lucide-react';
import { CalendarEntry, TryOnResponse } from '../types';
import { api } from '../api';

interface PlannerViewProps {
  outfits: TryOnResponse[];
  onOpenTryOn: (outfit: TryOnResponse) => void;
}

const WEEKDAYS = [
  { day: 'Monday', label: 'Mon', focus: 'College / Work Start' },
  { day: 'Tuesday', label: 'Tue', focus: 'Meetings & Presentations' },
  { day: 'Wednesday', label: 'Wed', focus: 'Midweek Smart Casual' },
  { day: 'Thursday', label: 'Thu', focus: 'Focus Day / Minimalist' },
  { day: 'Friday', label: 'Fri', focus: 'Casual Friday to Evening' },
  { day: 'Saturday', label: 'Sat', focus: 'Weekend Streetwear & Outing' },
  { day: 'Sunday', label: 'Sun', focus: 'Brunch & Relaxed Fit' },
];

export const PlannerView: React.FC<PlannerViewProps> = ({ outfits, onOpenTryOn }) => {
  const [plannerEntries, setPlannerEntries] = useState<CalendarEntry[]>([]);
  const [assigningDay, setAssigningDay] = useState<string | null>(null);
  const [selectedOutfitId, setSelectedOutfitId] = useState<number | null>(null);
  const [occasionTag, setOccasionTag] = useState<string>('Casual');
  const [weatherNote, setWeatherNote] = useState<string>('Sunny 23°C');

  const fetchPlanner = async () => {
    try {
      const data = await api.getWeeklyPlanner();
      setPlannerEntries(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlanner();
  }, []);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningDay || !selectedOutfitId) return;

    try {
      await api.assignPlannerDay({
        outfit_id: selectedOutfitId,
        scheduled_date: assigningDay,
        occasion: occasionTag,
        weather_note: weatherNote,
      });
      setAssigningDay(null);
      setSelectedOutfitId(null);
      fetchPlanner();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveEntry = async (id: number) => {
    try {
      await api.removePlannerEntry(id);
      fetchPlanner();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-studio-accentSubtle border border-studio-accent/20 text-studio-accent text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Weekly Fashion Schedule</span>
          </div>
          <h2 className="text-2xl font-bold text-studio-text font-display">Outfit Planner</h2>
          <p className="text-xs text-studio-muted">
            Eliminate morning decision fatigue. Schedule your synthesized fits Monday through Sunday with weather and occasion cues.
          </p>
        </div>
      </div>

      {/* 7-Day Interactive Visual Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {WEEKDAYS.map((wd) => {
          const entry = plannerEntries.find((e) => e.scheduled_date === wd.day);
          const hasOutfit = Boolean(entry?.outfit);

          return (
            <div
              key={wd.day}
              className={`glass-card p-4 rounded-3xl border transition-all flex flex-col justify-between min-h-[340px] relative shadow-studio-card ${
                hasOutfit
                  ? 'border-studio-accent bg-studio-accentSubtle/30 ring-1 ring-studio-accent/20'
                  : 'border-studio-border bg-studio-card'
              }`}
            >
              {/* Day Badge */}
              <div className="pb-2 border-b border-studio-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-studio-text font-display">{wd.day}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-studio-secondary text-studio-muted font-medium border border-studio-border">
                    {wd.label}
                  </span>
                </div>
                <p className="text-[9px] text-studio-muted truncate">{wd.focus}</p>
              </div>

              {/* Center Content: Assigned Outfit or Add CTA */}
              <div className="flex-1 my-3 flex flex-col justify-center">
                {hasOutfit && entry?.outfit ? (
                  <div className="space-y-2">
                    <div
                      onClick={() => onOpenTryOn(entry.outfit!)}
                      className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-studio-secondary border border-studio-border cursor-pointer relative group"
                    >
                      <img
                        src={entry.outfit.generated_image_url}
                        alt={entry.outfit.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-studio-bg/90 border border-studio-border text-[9px] font-bold text-studio-text shadow-sm">
                        {entry.occasion}
                      </div>
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-studio-accent text-[9px] font-bold text-white flex items-center space-x-0.5 shadow-studio-sm">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>{entry.outfit.rating}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-studio-text truncate" title={entry.outfit.name}>
                        {entry.outfit.name}
                      </p>
                      <div className="flex items-center space-x-1 text-[10px] text-studio-muted mt-0.5">
                        <CloudSun className="w-3 h-3 text-amber-500" />
                        <span>{entry.weather_note || 'Pleasant 22°C'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAssigningDay(wd.day);
                      if (outfits[0]) setSelectedOutfitId(outfits[0].outfit_id);
                    }}
                    className="w-full h-44 rounded-2xl border-2 border-dashed border-studio-border hover:border-studio-accent flex flex-col items-center justify-center p-3 text-studio-muted hover:text-studio-accent transition-all group bg-studio-secondary/40"
                  >
                    <Plus className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-semibold text-center">Plan Fit</span>
                  </button>
                )}
              </div>

              {/* Bottom Actions */}
              {hasOutfit && entry ? (
                <div className="flex items-center justify-between pt-2 border-t border-studio-border">
                  <button
                    onClick={() => {
                      setAssigningDay(wd.day);
                      setSelectedOutfitId(entry.outfit_id);
                    }}
                    className="text-[10px] text-studio-accent hover:underline font-semibold"
                  >
                    Change
                  </button>
                  <button
                    onClick={() => handleRemoveEntry(entry.id)}
                    className="p-1 rounded text-studio-muted hover:text-red-500 transition-colors"
                    title="Remove assignment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-[10px] text-studio-muted text-center">Unassigned</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Assignment Modal */}
      {assigningDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-studio-card border border-studio-border rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-studio-text font-display mb-1">
              Plan Outfit for {assigningDay}
            </h3>
            <p className="text-xs text-studio-muted mb-5">Select a look from your saved lookbook</p>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-studio-muted block mb-1">
                  Choose Generated Look
                </label>
                {outfits.length === 0 ? (
                  <p className="text-xs text-red-500">
                    No outfits generated yet. Go to Virtual Try-On Studio to synthesize looks first!
                  </p>
                ) : (
                  <select
                    value={selectedOutfitId || ''}
                    onChange={(e) => setSelectedOutfitId(Number(e.target.value))}
                    className="w-full bg-studio-secondary border border-studio-border rounded-xl px-3 py-2 text-studio-text focus:outline-none focus:border-studio-accent cursor-pointer"
                    required
                  >
                    {outfits.map((o) => (
                      <option key={o.outfit_id} value={o.outfit_id}>
                        {o.name} ({o.occasion} • {o.rating}★)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-studio-muted block mb-1">
                    Occasion Tag
                  </label>
                  <select
                    value={occasionTag}
                    onChange={(e) => setOccasionTag(e.target.value)}
                    className="w-full bg-studio-secondary border border-studio-border rounded-xl px-3 py-2 text-studio-text focus:outline-none cursor-pointer"
                  >
                    <option value="Casual">Casual</option>
                    <option value="College">College</option>
                    <option value="Office">Office</option>
                    <option value="Date Night">Date Night</option>
                    <option value="Party">Party</option>
                    <option value="Gym & Active">Gym & Active</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-studio-muted block mb-1">
                    Weather Note
                  </label>
                  <input
                    type="text"
                    value={weatherNote}
                    onChange={(e) => setWeatherNote(e.target.value)}
                    placeholder="E.g. Sunny 22°C"
                    className="w-full bg-studio-secondary border border-studio-border rounded-xl px-3 py-2 text-studio-text focus:outline-none focus:border-studio-accent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-studio-border">
                <button
                  type="button"
                  onClick={() => setAssigningDay(null)}
                  className="px-4 py-2 text-studio-muted hover:text-studio-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedOutfitId}
                  className="px-5 py-2 bg-studio-accent hover:bg-studio-accentHover disabled:opacity-50 text-white font-semibold rounded-xl"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
