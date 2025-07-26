"use client";

import { useMemo } from "react";
import { clients } from "../data";

type ClientType = {
    name: string;
    number: string;
};

type Props = {
    query: string;
    onSelect: (client: ClientType) => void;
};

export default function ClientSearch({ query, onSelect }: Props) {
    const filteredClients = useMemo(() => {
        const lower = query.toLowerCase();
        return clients.filter(
            (c) =>
                c.name.toLowerCase().includes(lower) || c.number.includes(lower)
        );
    }, [query]);

    if (!query) return null;

    return (
        <div className="w-full max-h-40 overflow-y-auto border border-gray-200 rounded mb-4 absolute z-10 bg-white shadow">
            {filteredClients.length > 0 ? (
                filteredClients.map((c) => (
                    <div
                        key={c.number}
                        onClick={() => onSelect(c)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                        {c.name} - {c.number}
                    </div>
                ))
            ) : (
                <div className="px-3 py-2 text-gray-500 text-sm">No match found</div>
            )}
        </div>
    );
}
