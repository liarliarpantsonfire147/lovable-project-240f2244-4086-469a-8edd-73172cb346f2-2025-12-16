import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Item, CATEGORY_LABELS, STATUS_LABELS } from '@/types/database';
import { MapPin, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'lost':
        return 'status-lost';
      case 'found':
        return 'status-found';
      case 'claimed':
        return 'status-claimed';
      case 'recovered':
        return 'status-recovered';
      default:
        return 'status-closed';
    }
  };

  return (
    <Link to={`/item/${item.id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card">
        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">📦</span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={getStatusClass(item.status)}>
              {STATUS_LABELS[item.status]}
            </Badge>
            {item.is_verified && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="p-4">
          <Badge variant="outline" className="mb-2 text-xs">
            {CATEGORY_LABELS[item.category]}
          </Badge>
          <h3 className="font-display font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {item.description}
            </p>
          )}
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(item.date_lost_found), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
