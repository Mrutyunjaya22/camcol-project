import AvatarEl from "@/components/AvatarEl";
import Stars from "@/components/Stars";
import { mockReviews } from "@/lib/mockData";

const Reviews = () => (
  <div className="container mx-auto px-4 py-8 animate-fade-in">
    <div className="mb-8">
      <h1 className="text-3xl font-display font-bold text-foreground">Reviews</h1>
      <p className="text-muted-foreground mt-1">See what students say about each other</p>
    </div>

    <div className="space-y-4 max-w-2xl">
      {mockReviews.map((review, i) => (
        <div
          key={review.id}
          className="bg-card rounded-xl border border-border p-6 shadow-card animate-fade-in"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <AvatarEl name={review.reviewer.name} />
            <div>
              <div className="font-medium text-foreground">{review.reviewer.name}</div>
              <div className="text-xs text-muted-foreground">{review.reviewer.college} • {review.createdAt}</div>
            </div>
          </div>
          <div className="mb-2">
            <Stars rating={review.rating} size={14} />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">{review.comment}</p>
          <span className="text-xs font-medium text-primary">Re: {review.gigTitle}</span>
        </div>
      ))}
    </div>
  </div>
);

export default Reviews;
