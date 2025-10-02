import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Attendee } from "@/types/attendee";
import { toast } from "@/hooks/use-toast";

export const useAttendees = () => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load attendees from database on mount
  useEffect(() => {
    loadAttendees();
  }, []);

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel("attendees-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendees",
        },
        (payload) => {
          console.log("Realtime update:", payload);
          if (payload.eventType === "INSERT") {
            const newAttendee = dbToAttendee(payload.new);
            setAttendees((prev) => {
              const exists = prev.some((a) => a.id === newAttendee.id);
              return exists ? prev : [...prev, newAttendee];
            });
          } else if (payload.eventType === "UPDATE") {
            const updatedAttendee = dbToAttendee(payload.new);
            setAttendees((prev) =>
              prev.map((a) => (a.id === updatedAttendee.id ? updatedAttendee : a))
            );
          } else if (payload.eventType === "DELETE") {
            setAttendees((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAttendees = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("attendees")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data) {
        setAttendees(data.map(dbToAttendee));
      }
    } catch (error) {
      console.error("Error loading attendees:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los asistentes.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveAttendees = async (newAttendees: Attendee[], fileName?: string) => {
    try {
      // Clear existing attendees
      await supabase.from("attendees").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      // Insert new attendees
      const dbRecords = newAttendees.map((attendee) => attendeeToDb(attendee, fileName));
      const { error } = await supabase.from("attendees").insert(dbRecords);

      if (error) throw error;

      toast({
        title: "Datos sincronizados",
        description: "Los asistentes se guardaron correctamente en la base de datos.",
      });
    } catch (error) {
      console.error("Error saving attendees:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar los asistentes en la base de datos.",
      });
    }
  };

  const updateAttendee = async (updatedAttendee: Attendee) => {
    try {
      const dbRecord = attendeeToDb(updatedAttendee);
      const { error } = await supabase
        .from("attendees")
        .update(dbRecord)
        .eq("id", updatedAttendee.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating attendee:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el asistente.",
      });
      throw error;
    }
  };

  return {
    attendees,
    isLoading,
    setAttendees,
    saveAttendees,
    updateAttendee,
  };
};

// Helper functions to convert between Attendee and DB format
const dbToAttendee = (dbRecord: any): Attendee => {
  return {
    id: dbRecord.id,
    ...dbRecord.row_data,
    braceletNumber: dbRecord.bracelet_number,
    companionBraceletNumber: dbRecord.companion_bracelet_number,
  };
};

const attendeeToDb = (attendee: Attendee, fileName?: string) => {
  const { id, braceletNumber, companionBraceletNumber, ...rowData } = attendee;
  return {
    id,
    file_name: fileName,
    row_data: rowData,
    bracelet_number: braceletNumber,
    companion_bracelet_number: companionBraceletNumber,
  };
};
