// src/pages/TestAnalytics.js

import React, {
  useMemo,
  useState,
} from "react";

import "./TestAnalytics.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faM,
  faMedal,
  faCircleCheck,
  faMagnifyingGlass,
  faArrowUpAZ,
  faArrowDownAZ,
  faArrowUp19,
  faArrowDown91,
} from "@fortawesome/free-solid-svg-icons";

function TestAnalytics() {
  const allStudents = [
    {
      name: "Sarah Jenkins",
      id: "STD-2023-089",
      time: "42m 15s",
      score: 98,
      attended: true,
    },
    {
      name: "Michael Ross",
      id: "STD-2023-112",
      time: "58m 30s",
      score: 85.5,
      attended: true,
    },
    {
      name: "Emily Turner",
      id: "STD-2023-045",
      time: "45m 00s",
      score: 78.4,
      attended: true,
    },
    {
      name: "James Donovan",
      id: "STD-2023-188",
      time: "60m 00s",
      score: 62,
      attended: true,
    },
    {
      name: "Amanda Lewis",
      id: "STD-2023-032",
      time: "30m 12s",
      score: 33.3,
      attended: true,
    },
    {
      name: "Olivia Martin",
      id: "STD-2023-155",
      time: "--",
      score: null,
      attended: false,
    },
    {
      name: "Daniel Cooper",
      id: "STD-2023-011",
      time: "49m 22s",
      score: 74,
      attended: true,
    },
    {
      name: "Sophia Hall",
      id: "STD-2023-090",
      time: "--",
      score: null,
      attended: false,
    },
    {
      name: "Noah Wilson",
      id: "STD-2023-201",
      time: "38m 41s",
      score: 88,
      attended: true,
    },
    {
      name: "Emma Clark",
      id: "STD-2023-054",
      time: "44m 02s",
      score: 69,
      attended: true,
    },
    {
      name: "Liam Scott",
      id: "STD-2023-077",
      time: "52m 11s",
      score: 91,
      attended: true,
    },
    {
      name: "Ava Young",
      id: "STD-2023-134",
      time: "--",
      score: null,
      attended: false,
    },
    {
      name: "Ethan Walker",
      id: "STD-2023-210",
      time: "41m 17s",
      score: 72.5,
      attended: true,
    },
    {
      name: "Mia Allen",
      id: "STD-2023-044",
      time: "35m 10s",
      score: 81,
      attended: true,
    },
    {
      name: "Lucas King",
      id: "STD-2023-056",
      time: "--",
      score: null,
      attended: false,
    },
    {
      name: "Charlotte Adams",
      id: "STD-2023-176",
      time: "50m 20s",
      score: 65,
      attended: true,
    },
    {
      name: "Benjamin Hill",
      id: "STD-2023-099",
      time: "39m 14s",
      score: 95,
      attended: true,
    },
    {
      name: "Harper Green",
      id: "STD-2023-182",
      time: "46m 45s",
      score: 55,
      attended: true,
    },
    {
      name: "Henry Baker",
      id: "STD-2023-061",
      time: "--",
      score: null,
      attended: false,
    },
    {
      name: "Evelyn Carter",
      id: "STD-2023-142",
      time: "47m 33s",
      score: 89,
      attended: true,
    },
  ];

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("name-asc");
  const [page, setPage] = useState(1);

  const resultsPerPage = 10;

  const filteredStudents = useMemo(() => {
    let data = [...allStudents];

    // search
    data = data.filter((student) =>
      student.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    // filter
    if (filter === "attended") {
      data = data.filter((s) => s.attended);
    }

    if (filter === "not-attended") {
      data = data.filter((s) => !s.attended);
    }

    // sort
    switch (sort) {
      case "name-asc":
        data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        break;

      case "name-desc":
        data.sort((a, b) =>
          b.name.localeCompare(a.name)
        );
        break;

      case "marks-asc":
        data.sort(
          (a, b) =>
            (a.score ?? -1) - (b.score ?? -1)
        );
        break;

      case "marks-desc":
        data.sort(
          (a, b) =>
            (b.score ?? -1) - (a.score ?? -1)
        );
        break;

      default:
        break;
    }

    return data;
  }, [search, filter, sort]);

  const totalPages = Math.ceil(
    filteredStudents.length / resultsPerPage
  );

  const startIndex = (page - 1) * resultsPerPage;

  const visibleStudents = filteredStudents.slice(
    startIndex,
    startIndex + resultsPerPage
  );

  return (
    <div className="analytics-page">
      <h1 className="analytics-title">
        Test Analytics: MCQ Module 1
      </h1>

      {/* TOP CARDS */}
      <div className="analytics-cards">
        <div className="analytics-card">
          <div className="card-icon blue">
            <FontAwesomeIcon icon={faM} />
          </div>

          <p>CLASS AVERAGE</p>

          <h2>
            78.4%
            <span>/ 100</span>
          </h2>
        </div>

        <div className="analytics-card">
          <div className="card-icon green">
            <FontAwesomeIcon icon={faMedal} />
          </div>

          <p>HIGHEST SCORE</p>

          <h2>
            98.0%
            <span>by Sarah Jenkins</span>
          </h2>
        </div>

        <div className="analytics-card">
          <div className="pending-badge">
            5 Pending
          </div>

          <div className="card-icon dark">
            <FontAwesomeIcon
              icon={faCircleCheck}
            />
          </div>

          <p>COMPLETION RATE</p>

          <h2>
            75%
            <span>15/20 submitted</span>
          </h2>
        </div>
      </div>

      {/* TABLE */}
      <div className="results-wrapper">
        <div className="results-header">
          <h2>Individual Results</h2>

            <div className="table-actions">
              <div className="search-box">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                />

                <input
                  type="text"
                  placeholder="Search student..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />
              </div>
              <div className="filter-group">
                <span>Filter By</span>
                <select
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value)
                  }
                >
                  <option value="all">All</option>

                  <option value="attended">
                    Attended
                  </option>

                  <option value="not-attended">
                    Not Attended
                  </option>
                </select>
              </div>

              <div className="filter-group">
                <span>Sort By</span>

                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(e.target.value)
                  }
                >
                  <option value="name-asc">
                    Name Asc
                  </option>

                  <option value="name-desc">
                    Name Desc
                  </option>

                  <option value="marks-asc">
                    Marks Asc
                  </option>

                  <option value="marks-desc">
                    Marks Desc
                  </option>
                </select>
              </div>
            </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>STUDENT NAME</th>
                <th>ID NUMBER</th>
                <th>TIME TAKEN</th>
                <th>SCORE</th>
              </tr>
            </thead>

            <tbody>
              {visibleStudents.map(
                (student, index) => (
                  <tr key={index}>
                    <td className="student-name">
                      {student.name}
                    </td>

                    <td>{student.id}</td>

                    <td>{student.time}</td>

                    <td>
                      {student.attended ? (
                        <span className="score">
                          {student.score}%
                        </span>
                      ) : (
                        <span className="not-attended">
                          Not Attended
                        </span>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="table-footer">
          <p>
            Showing{" "}
            {Math.min(
              startIndex + 1,
              filteredStudents.length
            )}
            -
            {Math.min(
              startIndex + resultsPerPage,
              filteredStudents.length
            )}{" "}
            of {filteredStudents.length} students
          </p>

          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() =>
                setPage(page - 1)
              }
            >
              Prev
            </button>

            {[...Array(totalPages)].map(
              (_, index) => (
                <button
                  key={index}
                  className={
                    page === index + 1
                      ? "active-page"
                      : ""
                  }
                  onClick={() =>
                    setPage(index + 1)
                  }
                >
                  {index + 1}
                </button>
              )
            )}

            <button
              disabled={page === totalPages}
              onClick={() =>
                setPage(page + 1)
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestAnalytics;