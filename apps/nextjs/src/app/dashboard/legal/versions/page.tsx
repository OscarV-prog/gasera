"use client";

import { useState } from "react";
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

export default function AppVersionsPage() {
  const api = useTRPC();
  const [platform, setPlatform] = useState<
    "driver_app" | "client_app" | undefined
  >();

  const { data, isLoading } = useQuery(
    api.legal.listAppVersions.queryOptions({
      platform,
    }),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">App Versions</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage mobile app versions and requirements
          </p>
        </div>
        <Button>Add Version</Button>
      </div>

      {/* Platform Filter */}
      <div className="flex gap-2">
        <Button
          variant={platform === undefined ? "default" : "outline"}
          onClick={() => setPlatform(undefined)}
        >
          All
        </Button>
        <Button
          variant={platform === "driver_app" ? "default" : "outline"}
          onClick={() => setPlatform("driver_app")}
        >
          Driver App
        </Button>
        <Button
          variant={platform === "client_app" ? "default" : "outline"}
          onClick={() => setPlatform("client_app")}
        >
          Client App
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <div className="rounded-lg bg-white shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Build Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Release Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.map((version: any) => (
                <TableRow key={version.id}>
                  <TableCell className="font-medium">
                    {version.platform === "driver_app"
                      ? "Driver App"
                      : "Client App"}
                  </TableCell>
                  <TableCell>{version.versionNumber}</TableCell>
                  <TableCell>{version.buildNumber}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        version.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {version.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {version.releaseDate
                      ? new Date(version.releaseDate).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
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
