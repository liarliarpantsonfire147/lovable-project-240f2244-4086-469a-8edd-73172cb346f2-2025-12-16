import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Heart, Mail } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-success/5">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl font-bold mb-4">About Lost & Found</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're on a mission to help people reconnect with their lost belongings through community collaboration.
            </p>
          </div>
        </section>

        <section className="py-16 container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Target, title: 'Our Mission', text: 'To create a seamless platform that helps reunite people with their lost items quickly and efficiently.' },
              { icon: Users, title: 'Community Driven', text: 'Built by the community, for the community. Every report helps someone find what they lost.' },
              { icon: Heart, title: 'Making a Difference', text: 'Every recovered item represents a moment of relief and joy for its owner.' },
            ].map((item, i) => (
              <Card key={i} className="text-center">
                <CardContent className="pt-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="max-w-xl mx-auto">
            <CardContent className="pt-6 text-center">
              <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">Contact Us</h3>
              <p className="text-muted-foreground mb-2">Have questions? Reach out to us at:</p>
              <a href="mailto:support@lostandfound.com" className="text-primary hover:underline">
                support@lostandfound.com
              </a>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
