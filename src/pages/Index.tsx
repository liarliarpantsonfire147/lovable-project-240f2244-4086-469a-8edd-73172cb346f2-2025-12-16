import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Search, MapPin, Bell, Shield, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-success/5 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary mb-6">
              <Bell className="h-4 w-4" />
              <span>Helping reunite people with their belongings</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              Lost Something? <br />
              <span className="text-primary">Find It Here.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Our community-powered platform connects people who've lost items with those who've found them. Report, search, and recover.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="lost" size="lg" asChild>
                <Link to="/create?status=lost">
                  Report Lost Item
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="found" size="lg" asChild>
                <Link to="/create?status=found">
                  Report Found Item
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-success/10 blur-3xl" />
      </section>

      {/* Features */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: 'Search & Browse',
                description: 'Browse through reported items or search for something specific using filters.',
              },
              {
                icon: MapPin,
                title: 'Report & Track',
                description: 'Post detailed reports with photos, locations, and dates to help identify items.',
              },
              {
                icon: Shield,
                title: 'Connect & Recover',
                description: 'Get in touch with finders or owners and recover your belongings safely.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-emerald-500 rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Join our community and help make lost items found again.
            </p>
            <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-white/90 border-none" asChild>
              <Link to="/dashboard">
                Browse All Items
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
