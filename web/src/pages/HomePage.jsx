import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Shield, 
  Users, 
  MessageCircle, 
  Brain, 
  Clock, 
  Star, 
  ArrowRight, 
  CheckCircle, 
  Phone, 
  Mail, 
  MapPin,
  Menu,
  X,
  Play,
  Award,
  TrendingUp,
  Zap,
  BookOpen,
  GraduationCap,
  Calendar
} from 'lucide-react';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-orange-600" />,
      title: "Exam Stress Management",
      description: "Specialized support during exam seasons with proven techniques to reduce anxiety and improve focus."
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Peer Support Groups",
      description: "Connect with fellow students facing similar challenges in safe, moderated group sessions."
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-blue-600" />,
      title: "Career Guidance",
      description: "Get personalized advice on career paths, internships, and future opportunities from experts."
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-purple-600" />,
      title: "Family Communication",
      description: "Tools and guidance to help navigate difficult conversations with parents about mental health."
    },
    {
      icon: <Calendar className="w-8 h-8 text-pink-600" />,
      title: "Cultural Events Support",
      description: "Special resources during festivals and important cultural events that may impact mental well-being."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: "24/7 Crisis Support",
      description: "Immediate intervention and emergency support available anytime you need it most."
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Engineering Student, IIT Delhi",
      content: "UMANG helped me manage the pressure of JEE preparation. The peer support groups made me feel less alone in my journey.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Rahul Verma",
      role: "Medical Student, AIIMS",
      content: "The career guidance feature helped me choose my specialization. The counselors understood the unique pressures of medical education in India.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Ananya Patel",
      role: "Arts Student, DU",
      content: "As a first-generation college student, UMANG helped me navigate family expectations while pursuing my passion for literature.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=64&h=64&fit=crop&crop=face"
    }
  ];

  const stats = [
    { number: "25K+", label: "Students Helped" },
    { number: "150+", label: "Partner Colleges" },
    { number: "92%", label: "Report Reduced Stress" },
    { number: "24/7", label: "Available Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-50">
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-teal-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img src="/assets/branding/UMANG.png" alt="UMANG logo" className="h-10 w-auto scale-400" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-teal-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-teal-600 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-700 hover:text-teal-600 transition-colors">Reviews</a>
              <a href="#resources" className="text-gray-700 hover:text-teal-600 transition-colors">Resources</a>
              <a 
                href="/auth" 
                className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-teal-600 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-orange-100">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-700 hover:text-teal-600 transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-700 hover:text-teal-600 transition-colors">How It Works</a>
                <a href="#testimonials" className="text-gray-700 hover:text-teal-600 transition-colors">Reviews</a>
                <a href="#resources" className="text-gray-700 hover:text-teal-600 transition-colors">Resources</a>
                <a 
                  href="/auth" 
                  className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-6 py-2 rounded-full text-center hover:shadow-lg transition-all duration-300"
                >
                  Get Started
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-teal-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
                Your Mental Wellness
                <span className="block bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Matters Most
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                UMANG supports Indian college students with culturally relevant mental health resources. 
                Navigate academic pressure, family expectations, and career uncertainty with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a 
                  href="/auth"
                  className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </a>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-teal-600 hover:text-teal-600 transition-all duration-300 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 border border-orange-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">UMANG Counselor</h3>
                    <p className="text-sm text-green-600">● Online now</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-teal-50 rounded-2xl p-4">
                    <p className="text-gray-700">नमस्ते! I'm here to support you. How are you feeling today?</p>
                  </div>
                  <div className="bg-teal-600 text-white rounded-2xl p-4 ml-8">
                    <p>I'm stressed about upcoming semester exams and family expectations...</p>
                  </div>
                  <div className="bg-teal-50 rounded-2xl p-4">
                    <p className="text-gray-700">I understand exam pressure can be overwhelming. Let's work through some coping strategies together.</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-400 to-blue-400 rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-teal-400 to-blue-400 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-black text-orange-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Designed for Indian Students
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              UMANG addresses the unique challenges faced by college students in India with culturally relevant support.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-orange-100">
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              How UMANG Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting mental health support has never been easier. Follow these simple steps to start your wellness journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sign Up Securely</h3>
              <p className="text-gray-600">Create your confidential account in under 2 minutes. Your privacy is our top priority.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Start Chatting</h3>
              <p className="text-gray-600">Begin your conversation with our AI counselor or connect directly with a human therapist.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Track Progress</h3>
              <p className="text-gray-600">Monitor your mental wellness journey with personalized insights and progress tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-orange-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Student Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from Indian college students who found support and healing through UMANG.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-orange-100">
              <div className="flex items-center mb-6">
                <img 
                  src={testimonials[activeTestimonial].avatar} 
                  alt={testimonials[activeTestimonial].name}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{testimonials[activeTestimonial].name}</h4>
                  <p className="text-gray-600">{testimonials[activeTestimonial].role}</p>
                </div>
                <div className="ml-auto flex">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <blockquote className="text-lg text-gray-700 leading-relaxed italic">
                "{testimonials[activeTestimonial].content}"
              </blockquote>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial ? 'bg-teal-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Mental Health Resources
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Curated resources specifically for Indian college students to support your mental wellness journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-8 border border-orange-100">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Exam Stress Guide</h3>
              <p className="text-gray-600 mb-4">Practical techniques to manage exam anxiety and improve focus during high-pressure periods.</p>
              <a href="#" className="text-orange-600 font-medium flex items-center gap-2">
                Download PDF <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 border border-green-100">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Family Communication</h3>
              <p className="text-gray-600 mb-4">Guidance on discussing mental health with parents and family members in culturally sensitive ways.</p>
              <a href="#" className="text-green-600 font-medium flex items-center gap-2">
                Read Article <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Career Pathways</h3>
              <p className="text-gray-600 mb-4">Resources to help navigate career decisions and manage expectations in the Indian job market.</p>
              <a href="#" className="text-blue-600 font-medium flex items-center gap-2">
                Explore Resources <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-white mb-6">
            Ready to Start Your Mental Wellness Journey?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-3xl mx-auto">
            Join thousands of Indian college students who have found support, healing, and growth through UMANG.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/auth"
              className="bg-white text-orange-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </a>
            <a 
              href="#contact"
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-teal-600 transition-all duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">UMANG</span>
                <span className="text-sm text-gray-400">उमंग</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Providing accessible, confidential, and culturally relevant mental health support to college students across India.
              </p>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center text-gray-400">
                  <Phone className="w-5 h-5 mr-2" />
                  <span>+91-9123456789</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Mail className="w-5 h-5 mr-2" />
                  <span>support@umangindia.org</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>Mumbai, Maharashtra, India</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Student Stories</a></li>
                <li><a href="#resources" className="hover:text-white transition-colors">Resources</a></li>
                <li><a href="/auth" className="hover:text-white transition-colors">Get Started</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Crisis Resources</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partner With Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 UMANG. All rights reserved. Your mental health matters. आपका मानसिक स्वास्थ्य मायने रखता है।</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;