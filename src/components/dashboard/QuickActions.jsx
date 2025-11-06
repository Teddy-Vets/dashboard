import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Heart, Share2 } from "lucide-react";

export default function QuickActions({ onShareIntakeClick }) {
  return (
    <div className="flex gap-3 flex-wrap">
      <Button
        onClick={onShareIntakeClick}
        className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg"
      >
        <Share2 className="w-4 h-4 ml-2" />
        קישור לטופס היכרות
      </Button>

      <Link to={createPageUrl("CreateConsentForm")}>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg">
          <Heart className="w-4 h-4 ml-2" />
          טופס הכנה לניתוח
        </Button>
      </Link>
    </div>
  );
}