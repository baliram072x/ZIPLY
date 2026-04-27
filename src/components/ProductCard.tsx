import { Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product, Shop } from "@/data/seed";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import { useState } from "react";

export const ProductCard = ({ product, shop }: { product: Product; shop: Shop }) => {
  const [imgError, setImgError] = useState(false);
  const cart = useStore((s) => s.cart);
  const add = useStore((s) => s.addToCart);
  const dec = useStore((s) => s.decrement);
  const item = cart.find((c) => c.product.id === product.id);
  const otherShop = cart[0] && cart[0].shopId !== shop.id;

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:border-primary/40 hover:shadow-pop">
      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-gradient-card">
        {product.image && !imgError ? (
          <img 
            src={product.image} 
            alt={product.name} 
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-110" 
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-5xl">
            {product.emoji}
          </div>
        )}
      </div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {product.unit}
      </div>
      <div className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight">
        {product.name}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="font-display text-lg font-bold">₹{product.price}</div>
        <AnimatePresence mode="wait" initial={false}>
          {item ? (
            <motion.div
              key="qty"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground"
            >
              <button
                onClick={() => dec(product.id)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-primary-glow"
                aria-label="Remove one"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-4 text-center text-sm font-bold">{item.qty}</span>
              <button
                onClick={() => add(product, shop)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-primary-glow"
                aria-label="Add one"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="add"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => {
                if (otherShop) {
                  toast("Replacing items", {
                    description: "Cart had items from another shop. We swapped them out.",
                  });
                }
                add(product, shop);
              }}
              className="rounded-full border-2 border-primary px-4 py-1 text-sm font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
            >
              ADD
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};