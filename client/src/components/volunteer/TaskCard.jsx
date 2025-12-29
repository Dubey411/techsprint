import { MapPin, Clock, ArrowRight, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const TaskCard = ({ task, onAccept, onViewMap, actionLabel = "Accept Task", variant = "available" }) => {
    const isUrgent = new Date(task.expiryDate) < new Date(new Date().getTime() + 2 * 60 * 60 * 1000); // Less than 2 hours

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden"
        >
            {isUrgent && variant === 'available' && (
                <div className="absolute top-0 right-0 bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-bl-xl">Urgent</div>
            )}

            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl ${variant === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                        <Package className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 line-clamp-1">{task.title}</h3>
                        <p className="text-sm text-slate-500">{task.donor?.name || 'Restaurant'}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                    <span className="truncate">{task.donor?.address || 'Location Hidden'}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                    <Clock className="h-4 w-4 mr-2 text-slate-400" />
                    <span>Expires: {new Date(task.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium">{task.quantity}</span>
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium capitalize">{task.foodType}</span>
                </div>
            </div>

            {task.claimedBy && (
                <div className="flex items-center text-sm text-orange-600 font-medium mb-4 bg-orange-50 p-2 rounded-lg">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="truncate">Confirm By: {task.claimedBy.name || 'NGO'}</span>
                </div>
            )}

            <button
                onClick={() => onAccept(task.id)}
                className={`w-full py-2.5 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all ${variant === 'available'
                        ? 'bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
            >
                <span>{actionLabel}</span>
                <ArrowRight className="h-4 w-4" />
            </button>
            
            {variant === 'active' && (
                <button
                    onClick={onViewMap}
                    className="w-full mt-3 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
                >
                    <MapPin className="h-4 w-4" />
                    <span>View Map</span>
                </button>
            )}
        </motion.div>
    );
};

export default TaskCard;
