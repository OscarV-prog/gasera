"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button, Input, Label } from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function SupportContactsPage() {
  const api = useTRPC();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(
    api.faq.getSupportContact.queryOptions(undefined, {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    }),
  );

  const [formData, setFormData] = useState({
    supportPhone: "",
    supportEmail: "",
    supportWhatsapp: "",
    supportHours: "",
    emergencyPhone: "",
    officeAddress: "",
  });

  const updateMutation = useMutation(
    api.faq.updateSupportContact.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(api.faq.pathFilter());
        alert("Support contacts updated successfully!");
      },
    }),
  );

  // Update form when data loads
  useEffect(() => {
    if (data) {
      setFormData((prev) => {
        const newData = {
          supportPhone: data.supportPhone ?? "",
          supportEmail: data.supportEmail ?? "",
          supportWhatsapp: data.supportWhatsapp ?? "",
          supportHours: data.supportHours ?? "",
          emergencyPhone: data.emergencyPhone ?? "",
          officeAddress: data.officeAddress ?? "",
        };

        // Simple shallow comparison to avoid infinite loops
        if (
          prev.supportPhone === newData.supportPhone &&
          prev.supportEmail === newData.supportEmail &&
          prev.supportWhatsapp === newData.supportWhatsapp &&
          prev.supportHours === newData.supportHours &&
          prev.emergencyPhone === newData.emergencyPhone &&
          prev.officeAddress === newData.officeAddress
        ) {
          return prev;
        }

        return newData;
      });
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Support Contacts
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Configure support contact information displayed in mobile apps
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg bg-white p-6 shadow dark:border dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
      >
        <div>
          <Label htmlFor="supportPhone">Support Phone *</Label>
          <Input
            id="supportPhone"
            type="tel"
            value={formData.supportPhone}
            onChange={(e) =>
              setFormData({ ...formData, supportPhone: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="supportEmail">Support Email *</Label>
          <Input
            id="supportEmail"
            type="email"
            value={formData.supportEmail}
            onChange={(e) =>
              setFormData({ ...formData, supportEmail: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="supportWhatsapp">WhatsApp Number</Label>
          <Input
            id="supportWhatsapp"
            type="tel"
            value={formData.supportWhatsapp}
            onChange={(e) =>
              setFormData({ ...formData, supportWhatsapp: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="supportHours">Support Hours</Label>
          <Input
            id="supportHours"
            type="text"
            value={formData.supportHours}
            onChange={(e) =>
              setFormData({ ...formData, supportHours: e.target.value })
            }
            placeholder="e.g., Mon-Fri 9:00 AM - 6:00 PM"
          />
        </div>

        <div>
          <Label htmlFor="emergencyPhone">Emergency Phone</Label>
          <Input
            id="emergencyPhone"
            type="tel"
            value={formData.emergencyPhone}
            onChange={(e) =>
              setFormData({ ...formData, emergencyPhone: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="officeAddress">Office Address</Label>
          <textarea
            id="officeAddress"
            value={formData.officeAddress}
            onChange={(e) =>
              setFormData({ ...formData, officeAddress: e.target.value })
            }
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {updateMutation.error && (
          <div className="text-sm text-red-600">
            Error: {updateMutation.error.message}
          </div>
        )}
      </form>
    </div>
  );
}
