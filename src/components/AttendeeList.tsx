import { useState } from "react";
import { Search, Edit } from "lucide-react";
import { Attendee } from "@/types/attendee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface AttendeeListProps {
  attendees: Attendee[];
  onEditAttendee: (attendee: Attendee) => void;
}

export const AttendeeList = ({ attendees, onEditAttendee }: AttendeeListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAttendees = attendees.filter((attendee) =>
    Object.values(attendee).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getColumnHeaders = () => {
    if (attendees.length === 0) return [];
    const firstAttendee = attendees[0];
    return Object.keys(firstAttendee).filter(key => key !== "id");
  };

  const headers = getColumnHeaders();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar asistente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="text-base px-4 py-2">
          Total: {filteredAttendees.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {filteredAttendees.map((attendee) => (
          <Card key={attendee.id} className={`p-4 transition-smooth border-4 ${attendee.isConfirmed ? 'border-[#659252] bg-[#e6ffe6] shadow-lg shadow-green-200' : 'border-[#F6762C] bg-[#eaeaea]'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {headers.map((header) => (
                  <div key={header} className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#F6762C' }}>
                      {header === "braceletNumber" ? "NUMERO DE PULSERA" : 
                       header === "companionBraceletNumber" ? "PULSERA ACOMPAÑANTE" : 
                       header}
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#111317' }}>
                      {attendee[header] ?? "—"}
                    </p>
                  </div>
                ))}
                {attendee.braceletNumber && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#F6762C' }}>
                      NUMERO DE PULSERA
                    </p>
                    <Badge variant="default" className="font-mono">
                      #{attendee.braceletNumber}
                    </Badge>
                  </div>
                )}
                {attendee.companionBraceletNumber && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#F6762C' }}>
                      PULSERA ACOMPAÑANTE
                    </p>
                    <Badge variant="default" className="font-mono">
                      #{attendee.companionBraceletNumber}
                    </Badge>
                  </div>
                )}
              </div>
              <div
                size="sm"
                variant={attendee.isConfirmed ? "default" : "outline"}
                onClick={() => onEditAttendee(attendee)}
                className={`shrink-0 cursor-pointer px-3 py-2 rounded ${attendee.isConfirmed ? 'bg-[#659252] text-white font-bold' : 'border border-[#F6762C] text-[#F6762C]'} flex items-center gap-2`}
              >
                <Edit className="w-4 h-4" />
                {attendee.isConfirmed && <p className="ml-2">Confirmado</p>}
              </div>
            </div>
            {attendee.isConfirmed && (
              <div className="mt-2 bg-[#659252] text-white px-3 py-1 rounded-full text-xs font-bold inline-block">
                CONFIRMADO
              </div>
            )}
          </Card>
        ))}
        {filteredAttendees.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No se encontraron asistentes
          </div>
        )}
      </div>
    </div>
  );
};
