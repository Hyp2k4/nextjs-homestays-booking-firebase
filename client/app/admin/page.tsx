// @ts-nocheck
"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveLine } from "@nivo/line"
import { ResponsiveBar } from "@nivo/bar"
import { ResponsivePie } from "@nivo/pie"
import { useEffect, useState } from "react"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { useRouter } from "next/navigation"
import { getBookings, getHomestays, getHosts } from "@/lib/admin-service"
import { toast } from "sonner"
import { DollarSign, Users, CreditCard, Activity, Settings } from "lucide-react"

const App = () => {
    const { user, logout } = useAdminAuth()
    const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [stats, setStats] = useState({
        totalRevenue: 0,
        subscriptions: 0,
        sales: 0,
        activeNow: 0,
    })
    const [lineChartData, setLineChartData] = useState([])
    const [barChartData, setBarChartData] = useState([])
    const [pieChartData, setPieChartData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const bookings = await getBookings()
            const homestays = await getHomestays()
            const hosts = await getHosts()

            const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0)
            const sales = bookings.length

            setStats({
                totalRevenue,
                subscriptions: hosts.length,
                sales,
                activeNow: homestays.length,
            })

            // Process data for charts
            const salesByMonth = bookings.reduce((acc, booking) => {
                const month = new Date(booking.checkIn.seconds * 1000).getMonth()
                acc[month] = (acc[month] || 0) + 1
                return acc
            }, {})

            const lineData = [
                {
                    id: "Sales",
                    data: Object.entries(salesByMonth).map(([month, count]) => ({
                        x: new Date(0, month).toLocaleString('default', { month: 'short' }),
                        y: count,
                    })),
                },
            ]
            setLineChartData(lineData)

            const barData = Object.entries(salesByMonth).map(([month, count]) => ({
                name: new Date(0, month).toLocaleString('default', { month: 'short' }),
                count,
            }))
            setBarChartData(barData)

            const salesByCategory = homestays.reduce((acc, homestay) => {
                acc[homestay.type] = (acc[homestay.type] || 0) + 1
                return acc
            }, {})

            const pieData = Object.entries(salesByCategory).map(([id, value]) => ({
                id,
                value,
            }))
            setPieChartData(pieData)
        }

        fetchData()
    }, [])

    const handleLogout = () => {
        toast("Are you sure you want to log out?", {
            action: {
                label: "Yes",
                onClick: () => {
                    logout()
                    router.push('/login-admin')
                },
            },
            cancel: {
                label: "No",
            },
        });
    };

    const sidebarLinks = [
        { name: "Dashboard", path: "/admin", icon: <DollarSign className="w-6 h-6" /> },
        { name: "Homestay", path: "/admin/homestays", icon: <Users className="w-6 h-6" /> },
        { name: "Bookings", path: "/admin/bookings", icon: <CreditCard className="w-6 h-6" /> },
        { name: "Host", path: "/admin/hosts", icon: <Activity className="w-6 h-6" /> },
        { name: "Settings", path: "/admin/settings", icon: <Settings className="w-6 h-6" /> },
    ];

    return (
        <>
            <div className="flex">
                <div className="md:w-64 w-16 border-r h-screen text-base border-gray-300 pt-4 flex flex-col transition-all duration-300">
                    {sidebarLinks.map((item, index) => (
                        <a href={item.path} key={index}
                            className={`flex items-center py-3 px-4 gap-3 
                                ${index === 0 ? "border-r-4 md:border-r-[6px] bg-indigo-500/10 border-indigo-500 text-indigo-500"
                                    : "hover:bg-gray-100/90 border-white text-gray-700"
                                }`
                            }
                        >
                            {item.icon}
                            <p className="md:block hidden text-center">{item.name}</p>
                        </a>
                    ))}
                </div>
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSignIcon className="w-4 h-4 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                                <UsersIcon className="w-4 h-4 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+{stats.subscriptions}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                                <CreditCardIcon className="w-4 h-4 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+{stats.sales}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                                <ActivityIcon className="w-4 h-4 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+{stats.activeNow}</div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <LineChart data={lineChartData} className="w-full h-[300px]" />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Sales</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <BarChart data={barChartData} className="w-full h-[300px]" />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Sales by Category</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PieChart data={pieChartData} className="w-full h-[300px]" />
                            </CardContent>
                        </Card>
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Top Products</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <BarChart className="w-full h-[300px]" />
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </>
    );
};

function ActivityIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}


function BarChart(props) {
    return (
        <div {...props}>
            <ResponsiveBar
                data={[
                    { name: "Jan", count: 111 },
                    { name: "Feb", count: 157 },
                    { name: "Mar", count: 129 },
                    { name: "Apr", count: 150 },
                    { name: "May", count: 119 },
                    { name: "Jun", count: 72 },
                ]}
                keys={["count"]}
                indexBy="name"
                margin={{ top: 0, right: 0, bottom: 40, left: 40 }}
                padding={0.3}
                colors={["#2563eb"]}
                axisBottom={{
                    tickSize: 0,
                    tickPadding: 16,
                }}
                axisLeft={{
                    tickSize: 0,
                    tickValues: 4,
                    tickPadding: 16,
                }}
                gridYValues={4}
                theme={{
                    tooltip: {
                        chip: {
                            borderRadius: "9999px",
                        },
                        container: {
                            fontSize: "12px",
                            textTransform: "capitalize",
                            borderRadius: "6px",
                        },
                    },
                    grid: {
                        line: {
                            stroke: "#f3f4f6",
                        },
                    },
                }}
                tooltipLabel={({ id }) => `${id}`}
                enableLabel={false}
                role="application"
                ariaLabel="A bar chart showing data"
            />
        </div>
    )
}


function CreditCardIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
    )
}


function DollarSignIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    )
}


function LineChart(props) {
    return (
        <div {...props}>
            <ResponsiveLine
                data={[
                    {
                        id: "Desktop",
                        data: [
                            { x: "Jan", y: 43 },
                            { x: "Feb", y: 137 },
                            { x: "Mar", y: 61 },
                            { x: "Apr", y: 145 },
                            { x: "May", y: 26 },
                            { x: "Jun", y: 154 },
                        ],
                    },
                    {
                        id: "Mobile",
                        data: [
                            { x: "Jan", y: 60 },
                            { x: "Feb", y: 48 },
                            { x: "Mar", y: 177 },
                            { x: "Apr", y: 78 },
                            { x: "May", y: 96 },
                            { x: "Jun", y: 204 },
                        ],
                    },
                ]}
                margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
                xScale={{
                    type: "point",
                }}
                yScale={{
                    type: "linear",
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 0,
                    tickPadding: 16,
                }}
                axisLeft={{
                    tickSize: 0,
                    tickValues: 5,
                    tickPadding: 16,
                }}
                colors={["#2563eb", "#e11d48"]}
                pointSize={6}
                useMesh={true}
                gridYValues={6}
                theme={{
                    tooltip: {
                        chip: {
                            borderRadius: "9999px",
                        },
                        container: {
                            fontSize: "12px",
                            textTransform: "capitalize",
                            borderRadius: "6px",
                        },
                    },
                    grid: {
                        line: {
                            stroke: "#f3f4f6",
                        },
                    },
                }}
                role="application"
            />
        </div>
    )
}


function PieChart(props) {
    return (
        <div {...props}>
            <ResponsivePie
                data={[
                    { id: "Jan", value: 111 },
                    { id: "Feb", value: 157 },
                    { id: "Mar", value: 129 },
                    { id: "Apr", value: 150 },
                    { id: "May", value: 119 },
                    { id: "Jun", value: 72 },
                ]}
                sortByValue
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                cornerRadius={0}
                padAngle={0}
                borderWidth={1}
                borderColor={"#ffffff"}
                enableArcLinkLabels={false}
                arcLabel={(d) => `${d.id}`}
                arcLabelsTextColor={"#ffffff"}
                arcLabelsRadiusOffset={0.65}
                colors={["#2563eb"]}
                theme={{
                    labels: {
                        text: {
                            fontSize: "18px",
                        },
                    },
                    tooltip: {
                        chip: {
                            borderRadius: "9999px",
                        },
                        container: {
                            fontSize: "12px",
                            textTransform: "capitalize",
                            borderRadius: "6px",
                        },
                    },
                }}
                role="application"
            />
        </div>
    )
}


function UsersIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}

export default App;
