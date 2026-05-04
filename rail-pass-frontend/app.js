const { useState, useEffect } = React;

const API_BASE = "http://localhost:8080/api";
const USER_ID = 1;

// ============ REUSABLE COMPONENTS ============

// Button Component
function Button({ children, onClick, variant = "primary", className = "", ...props }) {
    const variants = {
        primary: "btn-primary-custom text-white px-8 py-3 rounded-lg font-semibold",
        secondary: "bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-all"
    };
    
    return (
        <button 
            className={`${variants[variant]} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}

// Input Component
function Input({ label, value, onChange, placeholder, type = "text", icon, ...props }) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-slate-200 text-sm font-semibold mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="input-custom w-full px-4 py-3 rounded-lg text-slate-100 placeholder-slate-400 transition-all"
                    {...props}
                />
                {icon && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

// Navigation Component
function Navigation() {
    return (
        <nav className="slide-in-down fixed top-0 w-full glass-effect z-50 border-b border-slate-700">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="gradient-text text-3xl font-bold tracking-tighter">
                        RAILPASS
                    </div>
                </div>
                
                {/* Navigation Links */}
                <div className="flex items-center gap-8">
                    <a href="#" className="nav-link text-slate-300 hover:text-cyan-400 transition-colors text-sm font-medium">
                        Search Trains
                    </a>
                    <a href="#" className="nav-link text-slate-300 hover:text-cyan-400 transition-colors text-sm font-medium">
                        My Bookings
                    </a>
                    <a href="#" className="nav-link text-slate-300 hover:text-cyan-400 transition-colors text-sm font-medium">
                        Support
                    </a>
                    <div className="h-6 w-px bg-slate-600"></div>
                    <div className="text-cyan-400 font-semibold text-sm">
                        👤 Hi, Roshan
                    </div>
                </div>
            </div>
        </nav>
    );
}

// Hero Section Component
function HeroSection() {
    return (
        <div className="pt-32 pb-12 text-center fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                Where to <span className="gradient-text">next?</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                Book your next journey with India's fastest railway platform.
            </p>
        </div>
    );
}

// Search Card Component
function SearchCard() {
    const [from, setFrom] = useState("New Delhi");
    const [to, setTo] = useState("Mumbai");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    // Get today's date in YYYY-MM-DD format for min attribute
    const today = new Date().toISOString().split('T')[0];

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setShowResults(true);

        try {
            const response = await fetch(`${API_BASE}/trains/search?source=${from}&destination=${to}`);
            const trains = await response.json();
            setResults(trains);
        } catch (err) {
            console.error("Error:", err);
            alert("Error connecting to backend. Ensure Spring Boot is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Search Card */}
            <div className="max-w-4xl mx-auto px-4 slide-in-up">
                <div className="glass-effect rounded-2xl p-8 md:p-10">
                    <form onSubmit={handleSearch} className="space-y-6">
                        {/* Input Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="From"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                placeholder="E.g. New Delhi"
                                icon="🚂"
                            />
                            <Input
                                label="To"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                placeholder="E.g. Mumbai"
                                icon="🎫"
                            />
                            <div className="w-full">
                                <label className="block text-slate-200 text-sm font-semibold mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    min={today}
                                    className="input-custom w-full px-4 py-3 rounded-lg text-slate-100 transition-all cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className="flex justify-center pt-4">
                            <Button 
                                type="submit"
                                className="w-full md:w-64 py-3 text-lg"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin">⏳</span> Searching...
                                    </span>
                                ) : (
                                    "Search Trains"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Results Section */}
            {showResults && (
                <div className="max-w-4xl mx-auto px-4 mt-12">
                    <div className="fade-in">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="text-slate-400 text-lg">
                                    <span className="animate-spin inline-block">⏳</span> Searching trains...
                                </div>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-slate-400 text-lg">
                                    No trains found for this route. Try different stations.
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white mb-6">
                                    {results.length} trains available from {from} to {to}
                                </h3>
                                {results.map((train) => (
                                    <TrainCard key={train.id} train={train} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

// Train Card Component
function TrainCard({ train }) {
    const formatTime = (isoStr) => {
        const d = new Date(isoStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="glass-effect rounded-xl p-6 hover:glass-effect-light transition-all cursor-pointer group fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                {/* Train Info */}
                <div>
                    <div className="text-cyan-400 text-sm font-semibold mb-1">
                        {train.trainNumber}
                    </div>
                    <h4 className="text-white font-bold text-lg group-hover:text-cyan-400 transition-colors">
                        {train.name}
                    </h4>
                    <p className="text-slate-500 text-xs mt-1">Daily Service</p>
                </div>

                {/* Route */}
                <div className="flex items-center justify-between gap-4">
                    <div className="text-center">
                        <div className="text-white font-bold">{formatTime(train.departureTime)}</div>
                        <div className="text-slate-400 text-sm">{train.source}</div>
                    </div>
                    <div className="text-cyan-400">→</div>
                    <div className="text-center">
                        <div className="text-white font-bold">{formatTime(train.arrivalTime)}</div>
                        <div className="text-slate-400 text-sm">{train.destination}</div>
                    </div>
                </div>

                {/* Availability */}
                <div className="text-center">
                    <div className="text-cyan-400 font-bold text-lg">{train.availableSeats}</div>
                    <p className="text-slate-400 text-xs">Seats Available</p>
                </div>

                {/* CTA */}
                <div className="flex justify-end">
                    <Button className="whitespace-nowrap">
                        Book Now
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ============ MAIN APP ============
function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 opacity-5 rounded-full blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <Navigation />
                <div className="pt-20">
                    <HeroSection />
                    <SearchCard />
                </div>
            </div>

            {/* Footer Spacing */}
            <div className="h-20"></div>
        </div>
    );
}

// Render App
ReactDOM.render(<App />, document.getElementById('root'));
