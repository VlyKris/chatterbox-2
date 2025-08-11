import { AuthButton } from "@/components/auth/AuthButton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Hash, MessageSquare, Users, Zap, ArrowRight, Check } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Navigation */}
      <motion.nav 
        className="w-full py-6 px-4 border-b border-border/50 backdrop-blur-sm bg-background/80"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Hash className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">SlackClone</span>
          </div>
          <AuthButton 
            trigger={<Button variant="outline">Sign In</Button>}
            dashboardTrigger={<Button>Go to App</Button>}
          />
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        className="container mx-auto px-4 py-20 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            Where work happens
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect your team, organize conversations, and get work done in channels designed for productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <AuthButton 
              trigger={
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              }
            />
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
        </motion.div>
      </motion.section>

      {/* Features Grid */}
      <motion.section 
        className="container mx-auto px-4 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Everything your team needs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features that bring your team together and keep everyone aligned.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: MessageSquare,
              title: "Organized Conversations",
              description: "Keep discussions focused with channels organized by topic, project, or team.",
              color: "text-blue-500"
            },
            {
              icon: Users,
              title: "Team Collaboration",
              description: "Work together seamlessly with real-time messaging and file sharing.",
              color: "text-green-500"
            },
            {
              icon: Hash,
              title: "Channel Management",
              description: "Create public and private channels to organize your team's work.",
              color: "text-purple-500"
            },
            {
              icon: Zap,
              title: "Real-time Updates",
              description: "Stay in sync with instant notifications and live message updates.",
              color: "text-yellow-500"
            },
            {
              icon: MessageSquare,
              title: "Direct Messages",
              description: "Have private conversations with team members when needed.",
              color: "text-red-500"
            },
            {
              icon: Users,
              title: "Workspace Management",
              description: "Manage multiple teams and projects in separate workspaces.",
              color: "text-indigo-500"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
            >
              <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section 
        className="container mx-auto px-4 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Start for free and scale as your team grows.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-8 rounded-xl border border-border bg-card"
          >
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-3xl font-bold mb-4">$0<span className="text-lg text-muted-foreground">/month</span></p>
            <ul className="space-y-3 mb-6">
              {[
                "Up to 10 team members",
                "Unlimited channels",
                "10,000 message history",
                "File sharing up to 5GB"
              ].map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <AuthButton 
              trigger={<Button variant="outline" className="w-full">Get Started</Button>}
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-8 rounded-xl border-2 border-primary bg-card relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              Popular
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <p className="text-3xl font-bold mb-4">$8<span className="text-lg text-muted-foreground">/month per user</span></p>
            <ul className="space-y-3 mb-6">
              {[
                "Unlimited team members",
                "Unlimited channels",
                "Unlimited message history",
                "Unlimited file storage",
                "Advanced workspace management",
                "Priority support"
              ].map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <AuthButton 
              trigger={<Button className="w-full">Start Free Trial</Button>}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="container mx-auto px-4 py-20 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Ready to transform how your team works?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of teams already using SlackClone to stay connected and productive.
          </p>
          <AuthButton 
            trigger={
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            }
          />
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Hash className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">SlackClone</span>
          </div>
          <p>&copy; 2024 SlackClone. Built with ❤️ for better team communication.</p>
        </div>
      </footer>
    </div>
  );
}