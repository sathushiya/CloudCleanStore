export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "staff" | "staffsupervisor";
  avatar: string;
  joinDate: string;
  status: "active" | "inactive" | "busy";
  permissions: StaffPermissions;
  performance: StaffPerformance;
  salary: number;
}

export interface StaffPermissions {
  canAddProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canManageStock: boolean;
  canManageStaff: boolean;
  canManageOrders: boolean;
  canViewReports: boolean;
  canManagePermissions: boolean;
}

export interface StaffPerformance {
  tasksCompleted: number;
  tasksDeclined: number;
  points: number;
  rating: number;
  totalEarnings: number;
  currentMonth: {
    tasks: number;
    earnings: number;
  };
}

export interface DeliveryTask {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  customerAddress: string; // Full address with district
  customerDistrict: string; // Customer's district
  shopDistrict: string; // Shop's district (default: Colombo)
  products: { name: string; quantity: number }[];
  total: number;
  status:
    | "pending"
    | "assigned"
    | "declined"
    | "in_progress"
    | "completed"
    | "cancelled";
  assignedTo: string | null;
  assignedAt: string | null;
  completedAt: string | null;
  declinedBy: string[];
  priority: "low" | "medium" | "high";
  deliveryTime: "express" | "standard";
  estimatedTime: string;
  createdAt: string;
  manuallyAssignedBySupervisor?: boolean; // True if supervisor forced assignment
}

export interface Notification {
  id: string;
  type: "order" | "staff" | "product" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high";
}

// Mock staff data
export const staffMembers: StaffMember[] = [
  {
    id: "staff-001",
    name: "Sarah Johnson",
    email: "staff@cloudclean.store",
    phone: "+1 (555) 201-0001",
    role: "staff",
    avatar: "SJ",
    joinDate: "2024-01-15",
    status: "active",
    permissions: {
      canAddProducts: true,
      canEditProducts: true,
      canDeleteProducts: false,
      canManageStock: true,
      canManageStaff: false,
      canManageOrders: true,
      canViewReports: true,
      canManagePermissions: false,
    },
    performance: {
      tasksCompleted: 245,
      tasksDeclined: 12,
      points: 1850,
      rating: 4.8,
      totalEarnings: 12450,
      currentMonth: {
        tasks: 42,
        earnings: 2100,
      },
    },
    salary: 3500,
  },
  {
    id: "staff-002",
    name: "Michael Chen",
    email: "delivery@cloudclean.store",
    phone: "+1 (555) 202-0002",
    role: "staff",
    avatar: "MC",
    joinDate: "2024-02-20",
    status: "active",
    permissions: {
      canAddProducts: false,
      canEditProducts: false,
      canDeleteProducts: false,
      canManageStock: false,
      canManageStaff: false,
      canManageOrders: false,
      canViewReports: false,
      canManagePermissions: false,
    },
    performance: {
      tasksCompleted: 189,
      tasksDeclined: 8,
      points: 1420,
      rating: 4.9,
      totalEarnings: 9450,
      currentMonth: {
        tasks: 38,
        earnings: 1900,
      },
    },
    salary: 3000,
  },
  {
    id: "staff-003",
    name: "Emily Rodriguez",
    email: "emily.r@cloudclean.store",
    phone: "+1 (555) 203-0003",
    role: "staff",
    avatar: "ER",
    joinDate: "2024-03-10",
    status: "busy",
    permissions: {
      canAddProducts: false,
      canEditProducts: false,
      canDeleteProducts: false,
      canManageStock: false,
      canManageStaff: false,
      canManageOrders: false,
      canViewReports: false,
      canManagePermissions: false,
    },
    performance: {
      tasksCompleted: 156,
      tasksDeclined: 15,
      points: 1180,
      rating: 4.6,
      totalEarnings: 7800,
      currentMonth: {
        tasks: 32,
        earnings: 1600,
      },
    },
    salary: 3000,
  },
  {
    id: "staff-004",
    name: "David Kim",
    email: "david.k@cloudclean.store",
    phone: "+1 (555) 204-0004",
    role: "staffsupervisor",
    avatar: "DK",
    joinDate: "2024-01-20",
    status: "active",
    permissions: {
      canAddProducts: true,
      canEditProducts: true,
      canDeleteProducts: true,
      canManageStock: true,
      canManageStaff: false,
      canManageOrders: true,
      canViewReports: true,
      canManagePermissions: false,
    },
    performance: {
      tasksCompleted: 298,
      tasksDeclined: 5,
      points: 2250,
      rating: 4.9,
      totalEarnings: 14900,
      currentMonth: {
        tasks: 48,
        earnings: 2400,
      },
    },
    salary: 4000,
  },
];

// Mock delivery tasks
export const deliveryTasks: DeliveryTask[] = [
  {
    id: "task-001",
    orderId: "ORD-2024-001",
    customerName: "John Doe",
    address: "123 Main St, Apt 4B",
    customerAddress: "123 Main St, Apt 4B, Colombo 03",
    customerDistrict: "Colombo",
    shopDistrict: "Colombo",
    products: [
      { name: "Multi-Surface Cleaner", quantity: 2 },
      { name: "Glass Cleaner", quantity: 1 },
    ],
    total: 35.97,
    status: "assigned",
    assignedTo: "staff-002",
    assignedAt: "2024-05-28T10:30:00",
    completedAt: null,
    declinedBy: [],
    priority: "high",
    deliveryTime: "express",
    estimatedTime: "25 min",
    createdAt: "2024-05-28T10:15:00",
  },
  {
    id: "task-002",
    orderId: "ORD-2024-002",
    customerName: "Jane Smith",
    address: "456 Park Ave, Suite 200",
    customerAddress: "456 Park Ave, Suite 200, Kandy",
    customerDistrict: "Kandy",
    shopDistrict: "Colombo",
    products: [
      { name: "Floor Polish", quantity: 1 },
      { name: "Disinfectant Spray", quantity: 3 },
    ],
    total: 63.96,
    status: "pending",
    assignedTo: null,
    assignedAt: null,
    completedAt: null,
    declinedBy: [],
    priority: "medium",
    deliveryTime: "standard",
    estimatedTime: "45 min",
    createdAt: "2024-05-28T10:00:00",
  },
  {
    id: "task-003",
    orderId: "ORD-2024-003",
    customerName: "Robert Brown",
    address: "789 Broadway, Floor 3",
    customerAddress: "789 Broadway, Floor 3, Colombo 07",
    customerDistrict: "Colombo",
    shopDistrict: "Colombo",
    products: [{ name: "Laundry Detergent", quantity: 2 }],
    total: 39.98,
    status: "in_progress",
    assignedTo: "staff-003",
    assignedAt: "2024-05-28T09:45:00",
    completedAt: null,
    declinedBy: [],
    priority: "medium",
    deliveryTime: "express",
    estimatedTime: "30 min",
    createdAt: "2024-05-28T09:30:00",
  },
  {
    id: "task-004",
    orderId: "ORD-2024-004",
    customerName: "Sarah Williams",
    address: "321 Fifth Avenue, Apt 12A",
    customerAddress: "321 Fifth Avenue, Apt 12A, Gampaha",
    customerDistrict: "Gampaha",
    shopDistrict: "Colombo",
    products: [
      { name: "Kitchen Deodorizer", quantity: 2 },
      { name: "Bathroom Tile Cleaner", quantity: 1 },
      { name: "Multi-Surface Spray", quantity: 1 },
    ],
    total: 47.95,
    status: "in_progress",
    assignedTo: "staff-002",
    assignedAt: "2024-05-28T11:15:00",
    completedAt: null,
    declinedBy: [],
    priority: "high",
    deliveryTime: "express",
    estimatedTime: "20 min",
    createdAt: "2024-05-28T11:00:00",
  },
  {
    id: "task-005",
    orderId: "ORD-2024-005",
    customerName: "Michael Johnson",
    address: "555 Madison Avenue, Suite 8B",
    customerAddress: "555 Madison Avenue, Suite 8B, Colombo 05",
    customerDistrict: "Colombo",
    shopDistrict: "Colombo",
    products: [
      { name: "Premium Floor Polish", quantity: 3 },
      { name: "Glass Cleaner", quantity: 2 },
    ],
    total: 89.94,
    status: "assigned",
    assignedTo: "staff-002",
    assignedAt: "2024-05-28T11:45:00",
    completedAt: null,
    declinedBy: [],
    priority: "medium",
    deliveryTime: "standard",
    estimatedTime: "35 min",
    createdAt: "2024-05-28T11:30:00",
  },
  {
    id: "task-006",
    orderId: "ORD-2024-006",
    customerName: "Emily Davis",
    address: "789 Lexington Ave, Apt 5C",
    customerAddress: "789 Lexington Ave, Apt 5C, Negombo",
    customerDistrict: "Negombo",
    shopDistrict: "Colombo",
    products: [
      { name: "Eco-Friendly Glass Cleaner", quantity: 2 },
      { name: "Kitchen Deodorizer", quantity: 1 },
    ],
    total: 28.97,
    status: "assigned",
    assignedTo: "staff-001",
    assignedAt: "2024-05-28T12:00:00",
    completedAt: null,
    declinedBy: [],
    priority: "high",
    deliveryTime: "express",
    estimatedTime: "18 min",
    createdAt: "2024-05-28T11:45:00",
  },
  {
    id: "task-007",
    orderId: "ORD-2024-007",
    customerName: "David Martinez",
    address: "234 West 42nd Street, Floor 10",
    customerAddress: "234 West 42nd Street, Floor 10, Colombo 02",
    customerDistrict: "Colombo",
    shopDistrict: "Colombo",
    products: [
      { name: "Disinfectant Spray", quantity: 4 },
      { name: "Multi-Surface Cleaner", quantity: 2 },
      { name: "Bathroom Tile Cleaner", quantity: 1 },
    ],
    total: 95.93,
    status: "in_progress",
    assignedTo: "staff-001",
    assignedAt: "2024-05-28T11:30:00",
    completedAt: null,
    declinedBy: [],
    priority: "medium",
    deliveryTime: "standard",
    estimatedTime: "40 min",
    createdAt: "2024-05-28T11:15:00",
  },
  {
    id: "task-008",
    orderId: "ORD-2024-008",
    customerName: "Patricia Wilson",
    address: "678 Ocean Drive, Unit 9",
    customerAddress: "678 Ocean Drive, Unit 9, Colombo 04",
    customerDistrict: "Colombo",
    shopDistrict: "Colombo",
    products: [
      { name: "Window Cleaner", quantity: 3 },
      { name: "Floor Wax", quantity: 1 },
    ],
    total: 52.98,
    status: "pending",
    assignedTo: null,
    assignedAt: null,
    completedAt: null,
    declinedBy: ["staff-002"], // Declined by Michael Chen (delivery@cloudclean.store)
    priority: "high",
    deliveryTime: "express",
    estimatedTime: "22 min",
    createdAt: "2024-05-28T12:15:00",
  },
  {
    id: "task-009",
    orderId: "ORD-2024-009",
    customerName: "Thomas Anderson",
    address: "990 Sunset Boulevard, Apt 3D",
    customerAddress: "990 Sunset Boulevard, Apt 3D, Kalutara",
    customerDistrict: "Kalutara",
    shopDistrict: "Colombo",
    products: [
      { name: "All-Purpose Cleaner", quantity: 4 },
      { name: "Furniture Polish", quantity: 2 },
    ],
    total: 68.94,
    status: "pending",
    assignedTo: null,
    assignedAt: null,
    completedAt: null,
    declinedBy: ["staff-002", "staff-003"], // Declined by both delivery staff
    priority: "medium",
    deliveryTime: "standard",
    estimatedTime: "50 min",
    createdAt: "2024-05-28T12:20:00",
  },
];

// Mock notifications
export const notifications: Notification[] = [
  {
    id: "notif-001",
    type: "order",
    title: "New Order Received",
    message: "Order #ORD-2024-005 needs delivery assignment",
    timestamp: "2024-05-28T11:15:00",
    read: false,
    priority: "high",
  },
  {
    id: "notif-002",
    type: "staff",
    title: "Staff Member Declined Task",
    message: "Emily Rodriguez declined task #task-004. Auto-reassigning...",
    timestamp: "2024-05-28T10:45:00",
    read: false,
    priority: "medium",
  },
  {
    id: "notif-003",
    type: "product",
    title: "Low Stock Alert",
    message: "Multi-Surface Cleaner (500ml) stock below 10 units",
    timestamp: "2024-05-28T10:30:00",
    read: true,
    priority: "high",
  },
  {
    id: "notif-004",
    type: "system",
    title: "No Available Delivery Staff",
    message: "Order #ORD-2024-006 delayed - all staff busy",
    timestamp: "2024-05-28T10:00:00",
    read: true,
    priority: "high",
  },
];

export function autoAssignDeliveryTask(
  task: DeliveryTask,
  staff: StaffMember[],
): DeliveryTask | null {
  // Find available staff who haven't declined this task
  const availableStaff = staff.filter(
    (s) =>
      s.role === "staff" &&
      s.status === "active" &&
      !task.declinedBy.includes(s.id),
  );

  if (availableStaff.length === 0) {
    return null; // No available staff
  }

  // Assign to staff with best performance (highest rating)
  const bestStaff = availableStaff.sort(
    (a, b) => b.performance.rating - a.performance.rating,
  )[0];

  return {
    ...task,
    status: "assigned",
    assignedTo: bestStaff.id,
    assignedAt: new Date().toISOString(),
  };
}

export function handleTaskDecline(
  task: DeliveryTask,
  staffId: string,
  allStaff: StaffMember[],
): DeliveryTask | null {
  const updatedTask: DeliveryTask = {
    ...task,
    status: "pending",
    assignedTo: null,
    assignedAt: null,
    declinedBy: [...task.declinedBy, staffId],
  };

  // Try to auto-reassign
  return autoAssignDeliveryTask(updatedTask, allStaff);
}
