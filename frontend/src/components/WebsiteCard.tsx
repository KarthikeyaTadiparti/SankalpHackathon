import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface WebsiteCardProps {
  name: string;
  url: string;
  rating: number;
  status: "Legit" | "Scam" | "Suspicious";
}

const WebsiteCard = ({ name, url, rating, status }: WebsiteCardProps) => {
  const getBadgeClasses = (status: string) => {
    switch (status) {
      case "Legit":
        return "bg-green-100 text-green-800 border-green-200";
      case "Scam":
        return "bg-red-100 text-red-800 border-red-200";
      case "Suspicious":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
      />
    ));
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="space-y-3">
        {/* Website Name */}
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>

        {/* Website URL */}
        <p className="text-sm text-gray-600 underline truncate">{url}</p>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {renderStars(rating)}
          <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge className={`border ${getBadgeClasses(status)} px-3 py-1 rounded-full`}>
            {status}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default WebsiteCard;
