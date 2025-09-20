import { useEffect, useState } from "react";
import axios from "axios";
import WebsiteCard from "@/components/WebsiteCard";

interface ReviewType {
  _id: string;
  websiteName: string;
  websiteUrl: string;
  feedback: string;
  rating: number;
  username: string;
  createdAt: string;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/reviews", {
          withCredentials: true,
        });
        setReviews(response.data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) return <p className="text-center py-12">Loading reviews...</p>;
  if (error) return <p className="text-center py-12 text-red-500">{error}</p>;
  if (reviews.length === 0) return <p className="text-center py-12">No reviews found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review) => (
        <WebsiteCard
          key={review._id}
          name={review.websiteName}
          url={review.websiteUrl}
          rating={review.rating}
          status="Suspicious" // Optional: you can determine status dynamically if needed
          feedback={review.feedback}
          username={review.username}
        />
      ))}
    </div>
  );
};

export default Reviews;
