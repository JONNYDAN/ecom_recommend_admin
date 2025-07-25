import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { KEY_LOGIN_RESULT } from "../utils/constants";

const MainLayout = () => {const navigate = useNavigate();
    const location = useLocation();
    const [loginResult, setLoginResult] = useState(null);
    const [showProfileDropDown, setShowProfileDropDown] = useState(false);
    const [navigationOptions, setNavigationOptions] = useState([]);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const storedLoginResultString = localStorage.getItem(KEY_LOGIN_RESULT);
        
        if (!storedLoginResultString) {
            navigate("/"); // Redirect if no login data
            return;
        }
    
        try {
            const storedLoginResult = JSON.parse(storedLoginResultString);
            
            if (storedLoginResult) {
                setLoginResult(storedLoginResult);
                if (storedLoginResult.role === "admin") {
                    setNavigationOptions([
                        { route_to: "/admin", label: "Admins" },
                        { route_to: "/admin/users", label: "Users" },
                        // { route_to: "/admin/posts", label: "Posts" },
                        { route_to: "/admin/products", label: "Products" },
                        { route_to: "/admin/order", label: "Orders" },
                        // { route_to: "/admin/categories", label: "Categories" },
                        // { route_to: "/admin/feedback", label: "Feedback" },
                    ]);
                }
            } else {
                navigate("/");
            }
        } catch (error) {
            console.error("Error parsing login result:", error);
            localStorage.removeItem(KEY_LOGIN_RESULT); // Clear corrupted data
            navigate("/");
        }
    
        // Add event listener for dropdown close
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                closeProfileDropDown();
            }
        }
    
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [navigate]); // ✅ Include navigate as a dependency

    const toggleProfileDropDownVisibility = () => {
        setShowProfileDropDown(!showProfileDropDown);
    };

    const closeProfileDropDown = () => {
        setShowProfileDropDown(false);
    };

    const signOut = () => {
        localStorage.removeItem(KEY_LOGIN_RESULT);
        setLoginResult(null);
        setNavigationOptions([]); // Clear navigation options
        navigate("/");
    };

    const openUserPreview = () => {
        navigate(`/admin/show-user-details/${loginResult._id}`);
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!isSidebarCollapsed);
    };

    const activeComponent = location.pathname;
    // useEffect(() => {
    //     const storedLoginResult = JSON.parse(localStorage.getItem(KEY_LOGIN_RESULT));
    //     if (storedLoginResult === null) {
    //         navigate("/");
    //     }
    //     if (storedLoginResult) {
    //         setLoginResult(storedLoginResult);
    //     }
    //     // Add event listener to the document to close the dropdown on outside click
    //     function handleClickOutside(event) {
    //         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
    //             closeProfileDropDown();
    //         }
    //     }

    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () => {
    //         document.removeEventListener("mousedown", handleClickOutside);
    //     };
    // }, []); // Empty dependency array to run this effect only once



    // const navigate = useNavigate();
    // const location = useLocation();
    // const [loginResult, setLoginResult] = useState(null);
    // const [showProfileDropDown, setShowProfileDropDown] = useState(false);

    // // Ref to store a reference to the dropdown container
    // const dropdownRef = useRef(null);


    // const toggleProfileDropDownVisibility = () => {
    //     setShowProfileDropDown(!showProfileDropDown);
    // };

    // const closeProfileDropDown = () => {
    //     setShowProfileDropDown(false);
    // };

    // const signOut = () => {
    //     localStorage.removeItem(KEY_LOGIN_RESULT);
    //     navigate("/");
    // };

    // const openUserPreview = () => {
    //     navigate(`/admin/show-user-details/${loginResult._id}`);
    // };

    // const navigationOptions = [
    //     { route_to: "/admin", label: "Admins" },
    //     { route_to: "/admin/users", label: "Users" },
    //     { route_to: "/admin/posts", label: "Posts" },
    //     { route_to: "/admin/products", label: "Products" },
    //     { route_to: "/admin/order", label: "Orders" },
    //     { route_to: "/admin/categories", label: "Categories" },
    //     { route_to: "/admin/feedback", label: "Feedback" },
    // ];

    // const activeComponent = location.pathname;
    return (
        <div className="antialiased bg-gray-50">
            <nav className="bg-white border-b border-gray-200 px-4 py-2.5 fixed left-0 right-0 top-0 z-40">
                <div className="flex flex-wrap justify-end items-center">

                    <div className="flex items-center">

                        {loginResult ? (<button
                            type="button"
                            className="flex mx-3 text-sm bg-gray-300 rounded-full focus:ring-4 focus:ring-gray-300"
                            id="user-menu-button"
                            aria-expanded="false"
                            onClick={toggleProfileDropDownVisibility}>
                            <span className="sr-only">Open user menu</span>
                            <img
                                className="w-8 h-8 rounded-full"
                                src={loginResult.profile_pic}
                                alt="user"
                            />
                        </button>) : null}
                        {/*<!-- Dropdown menu -->*/}
                        {loginResult ? (
                            <div
                                ref={dropdownRef}
                                className={`${showProfileDropDown ? "block" : "hidden"} z-50 my-4 w-56 text-base list-none bg-white rounded divide-y divide-gray-100 shadow absolute top-8 right-4`}
                                id="dropdown">
                                <div className="py-3 px-4">
                                    <span
                                        className="block text-sm font-semibold text-gray-900">{loginResult.firstname} {loginResult.lastname}</span>
                                    <span
                                        className="block text-sm text-gray-900 truncate ">{loginResult.email}</span>
                                </div>
                                <ul
                                    className="py-1 text-gray-700 "
                                    aria-labelledby="dropdown">
                                    <li>
                                        <button onClick={() => openUserPreview()}
                                            className="block py-2 px-4 w-full text-sm text-left hover:bg-gray-100 hover:text-primary-700">My profile</button>
                                    </li>

                                </ul>
                                <ul
                                    className="py-1 text-gray-700 "
                                    aria-labelledby="dropdown" >
                                    <li>
                                        <button
                                            type="button"
                                            onClick={signOut}
                                            className="block py-2 px-4 w-full text-sm text-left hover:bg-gray-100 hover:text-primary-700">
                                            Sign out</button>

                                    </li>
                                </ul>
                            </div>

                        ) : null}
                    </div>
                </div>
            </nav>

            {/*<!-- Sidebar -->*/}

            <aside
                className="fixed top-0 left-0 z-50 w-64 h-screen transition-transform -translate-x-full bg-white border-r border-gray-200 md:translate-x-0 "
                aria-label="Sidenav"
                id="drawer-navigation">

                <div className="overflow-y-auto px-3 h-full bg-white ">
                    <div className="pt-4 pb-8">
                        <Link to="/admin" className="flex items-center justify-start">
                            <h1 className="text-2xl font-semibold whitespace-nowrap text-gray-900">Dashboard Admin</h1>
                        </Link>
                    </div>
                    <ul className="space-y-2">
                        {navigationOptions.map((option) => (
                            <li key={option.route_to}>
                                <Link
                                    to={option.route_to}
                                    className={`flex items-center p-2 text-base font-medium ${activeComponent === option.route_to
                                        ? "text-gray-900 bg-gray-100"
                                        : "text-gray-500"
                                        } rounded-lg  hover:bg-gray-200 group`}

                                >
                                    {option.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                </div>

            </aside>

            <main className="ml-64 h-auto">
                {loginResult ? (<Outlet />) : null}
            </main>
        </div>
    )
};


export default MainLayout;