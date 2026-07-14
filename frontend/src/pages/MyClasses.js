import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./MyClasses.css";

function initials(name = "") {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CL"
  );
}


function MyClasses() {

  const { user, loading: authLoading } = useAuth();

  const [courses, setCourses] = useState([]);
  const [sort, setSort] = useState("az");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");



  const loadCourses = async () => {

    setLoading(true);
    setError("");

    try {

      setCourses(await api.courses());

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };




  useEffect(() => {

    loadCourses();

    window.addEventListener(
      "courses:changed",
      loadCourses
    );


    return () =>
      window.removeEventListener(
        "courses:changed",
        loadCourses
      );

  }, []);





  useEffect(() => {

    const handleSearch = (event) =>
      setSearchQuery(event.detail || "");


    window.addEventListener(
      "classes:search",
      handleSearch
    );


    return () =>
      window.removeEventListener(
        "classes:search",
        handleSearch
      );

  }, []);





  const sortedCourses = useMemo(() => {

    const query = searchQuery.trim().toLowerCase();


    return courses
      .filter(
        (course) =>
          !query ||
          [
            course.name,
            course.teacher_name,
            course.course_code,
          ].some((value) =>
            value
              ?.toLowerCase()
              .includes(query)
          )
      )

      .sort((a, b) => {

        if (sort === "za") {

          return b.name.localeCompare(a.name);

        }

        return a.name.localeCompare(b.name);

      });


  }, [courses, sort, searchQuery]);





  return (

    <div className="myclasses-page">


      <div className="myclasses-header">


        <h1 className="myclasses-heading">

          Welcome back,{" "}

          {authLoading
            ? "..."
            : user?.first_name}
        </h1>
        <p className="myclasses-subtitle">
          Here are your active classes.
        </p>
      </div>

      <div className="myclasses-topbar">
        <div className="myclasses-title">
          Your Classes
        </div>

        <div className="myclasses-sortbar">
          <div className="myclasses-sortlabel">
            Sort by:
          </div>



          <div className="myclasses-sortwrapper">
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value)
              }
            >
              <option value="az">
                Name (A-Z)
              </option>

              <option value="za">
                Name (Z-A)
              </option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="page-state">
          Loading classes...
        </div>
      )}

      {error && (
        <div className="form-message error">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        sortedCourses.length === 0 && (

        <div className="page-state">
          {searchQuery
            ? `No classes match “${searchQuery}”.`
            : "No classes found."}
        </div>
      )}

      <div className="myclasses-grid">
        {sortedCourses.map((course) => (
          <Link
            to={`/myclass/${course.id}`}
            className="myclasses-link"
            key={course.id}
          >
            <div className="myclasses-card">
              <div className="myclasses-cardheader">
                <div className="myclasses-cardicon">
                  {initials(course.name)}
                </div>
                <span className="myclasses-capsule">
                  {course.teacher === user?.id
                    ? "Teacher"
                    : "Student"}
                </span>
              </div>
              <h3 className="myclasses-cardtitle">
                {course.name}
              </h3>

              <p className="myclasses-teacher">
                {course.teacher_name ||
                  "Assigned teacher"}
              </p>

              <p className="myclasses-teacher">
                Code: {course.course_code}
              </p>
              <hr />

              <p className="myclasses-students">
                <span className="myclasses-studenticon">
                  <FontAwesomeIcon icon={faUsers} />
                </span>
                {course.enrollment_count || 0}
                Students
              </p>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MyClasses;