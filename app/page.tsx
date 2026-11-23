
"use client";

import { useEffect, useState } from "react";
import "./students.css";

type Student = {
  id: number;
  name: string;
  nim: string;
  major: string;
  semester: number;
};

const emptyForm = {
  name: "",
  nim: "",
  major: "",
  semester: "1",
};

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function loadStudents() {
    const response = await fetch("/api/students");
    const data = await response.json();

    if (response.ok) {
      setStudents(data);
    } else {
      setMessage(data.message || "Gagal memuat data mahasiswa");
    }
  }

  useEffect(() => {
    fetch("/api/students")
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Gagal memuat data mahasiswa"
          );
        }

        return data;
      })
      .then((data) => {
        setStudents(data);
      })
      .catch((error) => {
        setMessage(error.message);
      });
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setMessage("");

    const url = editId
      ? `/api/students/${editId}`
      : "/api/students";

    const method = editId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Operasi gagal");
      return;
    }

    setForm(emptyForm);
    setEditId(null);
    setMessage(
      editId
        ? "Data mahasiswa berhasil diperbarui!"
        : "Data mahasiswa berhasil ditambahkan!"
    );

    await loadStudents();
  }

  function handleEdit(student: Student) {
    setEditId(student.id);

    setForm({
      name: student.name,
      nim: student.nim,
      major: student.major,
      semester: String(student.semester),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus data mahasiswa ini?"
    );

    if (!confirmed) return;

    const response = await fetch(`/api/students/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Gagal menghapus data mahasiswa");
      return;
    }

    setMessage("Data mahasiswa berhasil dihapus!");
    await loadStudents();
  }

  function handleCancel() {
    setEditId(null);
    setForm(emptyForm);
    setMessage("");
  }

  return (
    <main className="container">
      <header className="header">
        <h1>Database Mahasiswa</h1>
      </header>

      <section className="form-card">
        <h2>
          {editId ? "Perbarui Data Mahasiswa" : "Tambah Mahasiswa Baru"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label>Nama Lengkap</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Masukkan nama lengkap"
            required
          />

          <label>Nomor Induk Mahasiswa (NIM)</label>
          <input
            name="nim"
            value={form.nim}
            onChange={handleChange}
            placeholder="Masukkan NIM"
            required
          />

          <label>Program Studi</label>
          <input
            name="major"
            value={form.major}
            onChange={handleChange}
            placeholder="Masukkan program studi"
            required
          />

          <label>Semester</label>
          <input
            name="semester"
            type="number"
            min="1"
            step="1"
            value={form.semester}
            onChange={handleChange}
            required
          />

          <div className="actions">
            <button type="submit">
              {editId ? "Perbarui Data" : "Tambah Mahasiswa"}
            </button>

            {editId && (
              <button
                type="button"
                className="cancel"
                onClick={handleCancel}
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {message && <p className="message">{message}</p>}
      </section>

      <section className="table-card">
        <div className="table-heading">
          <h2>Data Mahasiswa</h2>
          <span>{students.length} Mahasiswa Terdaftar</span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nama Lengkap</th>
                <th>NIM</th>
                <th>Program Studi</th>
                <th>Semester</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty">
                    Belum ada data mahasiswa.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.nim}</td>
                    <td>{student.major}</td>
                    <td>{student.semester}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="edit"
                          onClick={() => handleEdit(student)}
                        >
                          Ubah
                        </button>

                        <button
                          className="delete"
                          onClick={() => handleDelete(student.id)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
