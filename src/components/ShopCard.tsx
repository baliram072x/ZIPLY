import { Link } from "react-router-dom";
import { Star, Clock, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { Shop } from "@/data/seed";
import { etaMinutes, getDistance } from "@/data/seed";

export const ShopCard = ({ shop, best, userCoords }: { shop: Shop; best?: boolean; userCoords?: { lat: number, lng: number } }) => {
  const eta = etaMinutes(shop, userCoords);
  const distance = getDistance(shop, userCoords);
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link
        to={`/shop-view/${shop.id}`}
        className="group relative block overflow-hidden rounded-3xl border border-border bg-gradient-card p-5 shadow-soft transition hover:shadow-pop"
      >
        {best && (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gradient-hero px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-pop">
            <Sparkles className="h-3 w-3" /> Best pick
          </div>
        )}
        <div
          className={`mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${shop.color} text-3xl shadow-pop`}
        >
          {shop.emoji}
        </div>
        <div className="font-display text-lg font-bold leading-tight">
          {shop.name}
        </div>
        <div className="mb-3 line-clamp-1 text-sm text-muted-foreground">
          {shop.tagline}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium text-foreground/80">
          <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-success">
            <Star className="h-3 w-3 fill-current" /> {shop.rating}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {eta} min
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {distance} km
          </span>
        </div>
      </Link>
    </motion.div>
  );
};