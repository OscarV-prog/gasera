"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function LegalDocumentsPage() {
  const api = useTRPC();
  const { data, isLoading } = useQuery(
    api.legal.listDocuments.queryOptions({}),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Legal Documents</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage legal documents and their versions
          </p>
        </div>
        <Button>Add Document</Button>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <div className="rounded-lg bg-white shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Current Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.map((doc: any) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    {doc.documentType}
                  </TableCell>
                  <TableCell>{doc.title}</TableCell>
                  <TableCell>{doc.currentVersion || "N/A"}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        doc.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {doc.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/legal/documents/${doc.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
