import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { USER_DATA } from "./db";

// const USER_DATA = [
//     {
//       id: 1,
//       firstName: "Suman",
//       lastName: "Kumar",
//       email: "suman@test.com",
//       age: 10
//     },
//     {
//       id: 2,
//       firstName: "Rahul",
//       lastName: "Kumar",
//       email: "rahul@test.com",
//       age: 15
//     },
//   ];

const idb =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

const insertDataInIndexedDb = () => {
    //check for support
    if (!idb) {
        console.log("This browser doesn't support IndexedDB");
        return;
    }

    const request = idb.open("test-db", 1);

    request.onerror = function (event) {
        console.error("An error occurred with IndexedDB");
        console.error(event);
    };

    request.onupgradeneeded = function (event) {
        console.log(event);
        const db = request.result;

        if (!db.objectStoreNames.contains("userData")) {
            const objectStore = db.createObjectStore("userData", { keyPath: "id" });
        }
    };

    request.onsuccess = function () {
        console.log("Database opened successfully");

        const db = request.result;

        var tx = db.transaction("userData", "readwrite");
        var userData = tx.objectStore("userData");

        USER_DATA.forEach((item) => userData.add(item));

        return tx.complete;
    };
};

const IndexDb = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [addUser, setAddUser] = useState(false);
    const [editUser, setEditUser] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [selectedUser, setSelectedUser] = useState({});

    useEffect(() => {
        insertDataInIndexedDb();
        getAllData();
    }, []);

    const getAllData = () => {
        const dbPromise = idb.open("test-db", 1);
        dbPromise.onsuccess = () => {
            const db = dbPromise.result;

            var tx = db.transaction("userData", "readonly");
            var userData = tx.objectStore("userData");

            // const subaru = userData.get(5);
            // console.log(subaru)
            const users = userData.getAll();

            users.onsuccess = (query) => {
                setAllUsers(query.srcElement.result);
            };

            users.onerror = (query) => {
                console.log('error occured while loading initial data')
            };

            tx.oncomplete = function () {
                db.close();
            };
        };
        if(navigator.onLine == true){
            console.log('internet is connected')
        }
        else{
            console.log('internet is disconnected')
        }
        // setAllUsers(USER_DATA)

    };

    const handleSubmit = (event) => {
        const dbPromise = idb.open("test-db", 1);
        console.log(addUser, editUser);

        if (firstName && lastName && email) {
            dbPromise.onsuccess = () => {
                const db = dbPromise.result;

                var tx = db.transaction("userData", "readwrite");
                var userData = tx.objectStore("userData");
                //Add Data
                if (addUser) {
                    const users = userData.put({
                        id: allUsers?.length + 1,
                        firstName,
                        lastName,
                        email,
                    });
                    users.onsuccess = (query) => {
                        tx.oncomplete = function () {
                            db.close();
                        };
                        alert("User added!");
                        setFirstName("");
                        setLastName("");
                        setEmail("");
                        setAddUser(false);
                        getAllData();
                        event.preventDefault();
                    };
                } else { //Edit Data
                    const users = userData.put({
                        id: selectedUser?.id,
                        firstName,
                        lastName,
                        email,
                    });
                    users.onsuccess = (query) => {
                        tx.oncomplete = function () {
                            db.close();
                        };
                        alert("User updated!");
                        setFirstName("");
                        setLastName("");
                        setEmail("");
                        setEditUser(false);
                        getAllData();
                        setSelectedUser({});
                        event.preventDefault();
                    };
                }
            };
        } else {
            alert("Please enter all details");
        }
    };

    const deleteSelected = (user) => {
        const dbPromise = idb.open("test-db", 1);

        dbPromise.onsuccess = function () {
            const db = dbPromise.result;
            var tx = db.transaction("userData", "readwrite");
            var userData = tx.objectStore("userData");
            const deleteUser = userData.delete(user.id);

            deleteUser.onsuccess = (query) => {
                tx.oncomplete = function () {
                    db.close();
                };
                alert("User deleted!");
                getAllData();
            };
        };
    };

    return (
        <div className="row" style={{ padding: 100 }}>
            <div className="col-md-6">
                <div>
                    <button
                        className="btn btn-primary float-end mb-2"
                        onClick={() => {
                            setFirstName("");
                            setLastName("");
                            setEmail("");
                            setEditUser(false);
                            setAddUser(true);
                        }}
                    >
                        Add
                    </button>
                </div>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allUsers?.map((user) => {
                            return (
                                <tr key={user?.id}>
                                    <td>{user?.firstName}</td>
                                    <td>{user?.lastName}</td>
                                    <td>{user?.email}</td>
                                    <td>
                                        <button
                                            className="btn btn-success"
                                            onClick={() => {
                                                setAddUser(false);
                                                setEditUser(true);
                                                setSelectedUser(user);
                                                setEmail(user?.email);
                                                setFirstName(user?.firstName);
                                                setLastName(user?.lastName);
                                            }}
                                        >
                                            Edit
                                        </button>{" "}
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => deleteSelected(user)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="col-md-6">
                {editUser || addUser ? (
                    <div className="card" style={{ padding: "20px" }}>
                        <h3>{editUser ? "Update User" : "Add User"}</h3>
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                className="form-control"
                                onChange={(e) => setFirstName(e.target.value)}
                                value={firstName}
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                className="form-control"
                                onChange={(e) => setLastName(e.target.value)}
                                value={lastName}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                            />
                        </div>
                        <div className="form-group">
                            <button
                                className="btn btn-primary mt-2"
                                type="submit"
                                onClick={handleSubmit}
                            >
                                {editUser ? "Update" : "Add"}
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default IndexDb;