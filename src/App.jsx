import React from 'react'; // <-- WAJIB ADA DI BARIS PERTAMA


const METHODOLOGIES = {
  SPOT: {
    id: "SPOT",
    name: "Spot the Difference",
    alias: "Comparison Method",
    color: "#F59E0B",
    colorDim: "#78350F",
    colorBg: "#1C1007",
    icon: "⚖",
    trigger: "Ada perubahan sebelum masalah muncul",
    description:
      "Bandingkan kondisi yang berhasil dengan yang bermasalah. Cari perbedaan yang menjadi kandidat root cause.",
    steps: [
      "Identifikasi apa yang berubah sebelum masalah muncul",
      "Bandingkan config working vs non-working",
      "Isolasi perbedaan yang relevan",
      "Revert atau sesuaikan perbedaan satu per satu",
    ],
    warning:
      "Bedakan perbedaan yang disengaja dari perbedaan yang jadi penyebab — jangan samakan semua perbedaan.",
  },
  BOTTOM_UP: {
    id: "BOTTOM_UP",
    name: "Bottom-Up",
    alias: "L1 → L7",
    color: "#3B82F6",
    colorDim: "#1E3A5F",
    colorBg: "#0A0F1E",
    icon: "↑",
    trigger: "Zero connectivity / banyak sistem terdampak",
    description:
      "Mulai dari Physical layer (L1) naik ke atas secara berurutan. Masalah di layer bawah memanifestasikan diri sebagai gejala di layer atas.",
    steps: [
      "L1: Cek kabel, SFP, optical power, port status",
      "L2: Cek MAC table, ARP, VLAN, STP, LAG",
      "L3: Cek routing table, IP, subnet, ACL",
      "L4+: Cek TCP/UDP, port, firewall rule",
    ],
    warning:
      "Paling lambat jika masalah di L7. Gunakan hanya ketika tidak ada informasi lain sebagai starting point.",
  },
  TOP_DOWN: {
    id: "TOP_DOWN",
    name: "Top-Down",
    alias: "L7 → L1",
    color: "#8B5CF6",
    colorDim: "#3B1F6F",
    colorBg: "#0F0A1E",
    icon: "↓",
    trigger: "Single-app issue / L1-L3 diduga bersih",
    description:
      "Mulai dari Application layer (L7) turun ke bawah. Efisien ketika layer bawah kemungkinan besar bersih.",
    steps: [
      "L7: Cek aplikasi, DNS, HTTP response",
      "L4: Cek TCP handshake, port reachability",
      "L3: Cek routing, ACL, NAT",
      "L2-L1: Hanya jika layer atas bersih semua",
    ],
    warning:
      "Jangan gunakan jika banyak user terdampak sekaligus — indikasi L1-L2 yang akan memakan waktu lama untuk dicapai.",
  },
  MOVE: {
    id: "MOVE",
    name: "Move the Problem",
    alias: "Component Substitution",
    color: "#EF4444",
    colorDim: "#7F1D1D",
    colorBg: "#1A0505",
    icon: "⇄",
    trigger: "Suspect hardware / software check bersih",
    description:
      "Ganti atau pindahkan komponen satu per satu. Jika masalah ikut berpindah, komponen tersebut adalah kandidat root cause.",
    steps: [
      "Identifikasi komponen yang dicurigai",
      "Siapkan komponen cadangan",
      "Ganti SATU komponen per langkah",
      "Amati apakah masalah ikut berpindah atau hilang",
    ],
    warning:
      "Jangan ganti lebih dari satu komponen sekaligus — tidak bisa menentukan mana yang menjadi penyebab.",
  },
  FOLLOW: {
    id: "FOLLOW",
    name: "Follow the Path",
    alias: "Packet Walk",
    color: "#10B981",
    colorDim: "#064E3B",
    colorBg: "#021A10",
    icon: "→",
    trigger: "Multi-device path / cross-domain issue",
    description:
      "Ikuti jalur aktual paket dari source ke destination, periksa setiap hop. Cocok ketika traffic melewati banyak domain.",
    steps: [
      "Petakan jalur aktual: source → hop1 → hop2 → ... → dest",
      "Verifikasi setiap hop: routing, policy, state",
      "Cek forward path DAN return path (asymmetric routing)",
      "Isolasi hop di mana traffic berhenti atau berubah",
    ],
    warning:
      "Wajib cek return path — masalah asymmetric routing sering terlewat karena hanya forward path yang diverifikasi.",
  },
  DIVIDE: {
    id: "DIVIDE",
    name: "Divide & Conquer",
    alias: "Half-Split Method",
    color: "#06B6D4",
    colorDim: "#0E4F5E",
    colorBg: "#021A20",
    icon: "⊕",
    trigger: "Ada hipotesis / data monitoring tersedia",
    description:
      "Mulai dari titik tengah berdasarkan hipotesis atau data monitoring. Setiap hasil membelah problem space menjadi dua.",
    steps: [
      "Tentukan titik tengah berdasarkan informasi yang ada",
      "Cek kondisi di titik tengah tersebut",
      "Jika bermasalah: investigasi ke bawah/belakang",
      "Jika bersih: investigasi ke atas/depan",
    ],
    warning:
      "Tidak cocok untuk engineer junior tanpa hipotesis — tanpa intuisi, starting point jadi tebakan bukan keputusan.",
  },
};

const QUESTIONS = [
  {
    id: "Q1",
    text: "Apakah ada config change, upgrade, patch, atau perubahan apapun sebelum masalah muncul?",
    hint: "Termasuk: restart device, update firmware, perubahan policy, atau pekerjaan fisik di area terdampak",
    yes: { result: "SPOT" },
    no: { next: "Q2" },
  },
  {
    id: "Q2",
    text: "Apakah zero connectivity? Tidak ada traffic sama sekali, dan banyak user atau sistem terdampak sekaligus?",
    hint: "Zero connectivity = device tidak reachable, ping pun gagal total. Banyak sistem = bukan hanya satu user atau satu aplikasi",
    yes: { result: "BOTTOM_UP" },
    no: { next: "Q3" },
  },
  {
    id: "Q3",
    text: "Hanya SATU aplikasi yang bermasalah, sementara aplikasi lain di device atau jaringan yang sama masih normal?",
    hint: "Contoh: browser tidak bisa buka satu website tertentu, tapi ping dan aplikasi lain lancar",
    yes: { result: "TOP_DOWN" },
    no: { next: "Q4" },
  },
  {
    id: "Q4",
    text: "Software dan config check sudah bersih semua, tapi masalah masih ada? Atau suspect komponen hardware fisik?",
    hint: "Contoh: tidak ada error di config, tidak ada fault di log, tapi traffic masih bermasalah. Atau ada kabel / SFP / port yang dicurigai",
    yes: { result: "MOVE" },
    no: { next: "Q5" },
  },
  {
    id: "Q5",
    text: "Traffic melewati lebih dari 2 device berbeda, atau lintas domain (misalnya: router + firewall + load balancer)?",
    hint: "Contoh: client → switch → router → firewall → F5 LTM → server. Atau traffic melewati dua tim berbeda (network + security + aplikasi)",
    yes: { result: "FOLLOW" },
    no: { next: "Q6" },
  },
  {
    id: "Q6",
    text: "Ada data dari monitoring atau pengalaman sebelumnya yang menunjuk ke layer atau area tertentu sebagai suspect?",
    hint: "Contoh: grafana menunjukkan spike di interface tertentu, atau engineer pernah lihat masalah serupa di BGP layer",
    yes: { result: "DIVIDE" },
    no: { result: "BOTTOM_UP", fallback: true },
  },
];

const PROGRESS_LABELS = ["Perubahan?", "Konektivitas?", "Aplikasi?", "Hardware?", "Path?", "Data?"];

export default function App() {
  const [currentQ, setCurrentQ] = useState(0);
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [isFallback, setIsFallback] = useState(false);
  const [answers, setAnswers] = useState([]);

  const question = QUESTIONS[currentQ];

  const handleAnswer = (answer) => {
    const newAnswers = [...answers, { q: question.id, a: answer }];
    setAnswers(newAnswers);
    setHistory([...history, currentQ]);

    const outcome = answer === "yes" ? question.yes : question.no;

    if (outcome.result) {
      setResult(outcome.result);
      setIsFallback(outcome.fallback || false);
    } else {
      const nextIdx = QUESTIONS.findIndex((q) => q.id === outcome.next);
      setCurrentQ(nextIdx);
    }
  };

  const handleBack = () => {
    if (result) {
      setResult(null);
      setIsFallback(false);
      setAnswers(answers.slice(0, -1));
      return;
    }
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setCurrentQ(prev);
      setAnswers(answers.slice(0, -1));
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setHistory([]);
    setResult(null);
    setIsFallback(false);
    setAnswers([]);
  };

  const m = result ? METHODOLOGIES[result] : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080C14",
      color: "#E2E8F0",
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "24px 16px 48px",
    }}>
      {/* Header */}
      <div style={{ width: "100%", maxWidth: 520, marginBottom: 32 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
        }}>
          <span style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "#06B6D4",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}>
            Network KB
          </span>
          <span style={{ color: "#1E3A5F", fontSize: 11 }}>▸</span>
          <span style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "#475569",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}>
            Metodologi Troubleshoot
          </span>
        </div>
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#F1F5F9",
          margin: 0,
          letterSpacing: "-0.02em",
        }}>
          Pilih Metodologi
        </h1>
        <p style={{
          fontSize: 13,
          color: "#64748B",
          margin: "6px 0 0",
          lineHeight: 1.5,
        }}>
          Jawab pertanyaan berikut untuk menentukan pendekatan yang paling tepat.
        </p>
      </div>

      {/* Progress bar */}
      {!result && (
        <div style={{ width: "100%", maxWidth: 520, marginBottom: 28 }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}>
            {PROGRESS_LABELS.map((label, i) => (
              <div key={i} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                flex: 1,
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: i < currentQ
                    ? "2px solid #06B6D4"
                    : i === currentQ
                    ? "2px solid #06B6D4"
                    : "2px solid #1E293B",
                  background: i < currentQ
                    ? "#06B6D4"
                    : i === currentQ
                    ? "transparent"
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: i < currentQ ? "#080C14" : i === currentQ ? "#06B6D4" : "#334155",
                  fontWeight: 700,
                  transition: "all 0.3s",
                }}>
                  {i < currentQ ? "✓" : i + 1}
                </div>
                <span style={{
                  fontSize: 9,
                  color: i <= currentQ ? "#94A3B8" : "#334155",
                  textAlign: "center",
                  letterSpacing: "0.05em",
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div style={{
            height: 2,
            background: "#1E293B",
            borderRadius: 1,
            overflow: "hidden",
            marginTop: 4,
          }}>
            <div style={{
              height: "100%",
              width: `${(currentQ / (QUESTIONS.length - 1)) * 100}%`,
              background: "linear-gradient(90deg, #06B6D4, #3B82F6)",
              borderRadius: 1,
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>
      )}

      {/* Question Card */}
      {!result && (
        <div style={{
          width: "100%",
          maxWidth: 520,
          background: "#0D1422",
          border: "1px solid #1E293B",
          borderRadius: 16,
          padding: "28px 24px",
          marginBottom: 16,
        }}>
          <div style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "#06B6D4",
            letterSpacing: "0.2em",
            marginBottom: 16,
            textTransform: "uppercase",
          }}>
            Pertanyaan {currentQ + 1} dari {QUESTIONS.length}
          </div>

          <p style={{
            fontSize: 17,
            fontWeight: 600,
            color: "#F1F5F9",
            lineHeight: 1.55,
            margin: "0 0 20px",
          }}>
            {question.text}
          </p>

          {/* Hint */}
          <div style={{
            background: "#0A1020",
            border: "1px solid #1E293B",
            borderLeft: "3px solid #1E3A5F",
            borderRadius: 8,
            padding: "12px 14px",
            marginBottom: 24,
          }}>
            <span style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "#475569",
              letterSpacing: "0.1em",
              display: "block",
              marginBottom: 4,
              textTransform: "uppercase",
            }}>
              Contoh / Konteks
            </span>
            <p style={{
              fontSize: 12,
              color: "#64748B",
              margin: 0,
              lineHeight: 1.6,
            }}>
              {question.hint}
            </p>
          </div>

          {/* Answer buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => handleAnswer("yes")}
              style={{
                flex: 1,
                padding: "14px 20px",
                background: "#0A2020",
                border: "1px solid #134E48",
                borderRadius: 10,
                color: "#10B981",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.02em",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.target.style.background = "#0D3030";
                e.target.style.borderColor = "#10B981";
              }}
              onMouseLeave={e => {
                e.target.style.background = "#0A2020";
                e.target.style.borderColor = "#134E48";
              }}
            >
              Ya
            </button>
            <button
              onClick={() => handleAnswer("no")}
              style={{
                flex: 1,
                padding: "14px 20px",
                background: "#150A20",
                border: "1px solid #3B1F6F",
                borderRadius: 10,
                color: "#8B5CF6",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.02em",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.target.style.background = "#1F1030";
                e.target.style.borderColor = "#8B5CF6";
              }}
              onMouseLeave={e => {
                e.target.style.background = "#150A20";
                e.target.style.borderColor = "#3B1F6F";
              }}
            >
              Tidak
            </button>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && m && (
        <div style={{
          width: "100%",
          maxWidth: 520,
          marginBottom: 16,
        }}>
          {/* Fallback notice */}
          {isFallback && (
            <div style={{
              background: "#1A1200",
              border: "1px solid #78350F",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 12,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 14 }}>⚠</span>
              <p style={{
                fontSize: 12,
                color: "#D97706",
                margin: 0,
                lineHeight: 1.6,
              }}>
                Tidak ada cukup informasi untuk memilih metodologi yang lebih spesifik.
                Bottom-Up digunakan sebagai fallback — mulai dari L1 dan naik secara sistematis.
              </p>
            </div>
          )}

          {/* Main result */}
          <div style={{
            background: m.colorBg,
            border: `1px solid ${m.colorDim}`,
            borderTop: `3px solid ${m.color}`,
            borderRadius: 16,
            padding: "28px 24px",
            marginBottom: 12,
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 20,
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: m.colorDim,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                color: m.color,
                fontWeight: 900,
              }}>
                {m.icon}
              </div>
              <div>
                <div style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: m.color,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: 3,
                  opacity: 0.8,
                }}>
                  Metodologi yang disarankan
                </div>
                <div style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#F1F5F9",
                  letterSpacing: "-0.02em",
                }}>
                  {m.name}
                </div>
                <div style={{
                  fontSize: 12,
                  color: "#64748B",
                  marginTop: 2,
                }}>
                  {m.alias}
                </div>
              </div>
            </div>

            {/* Trigger */}
            <div style={{
              background: "#080C14",
              border: `1px solid ${m.colorDim}`,
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 20,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}>
              <span style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: m.color,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}>
                Trigger
              </span>
              <span style={{
                fontSize: 12,
                color: "#94A3B8",
              }}>
                {m.trigger}
              </span>
            </div>

            {/* Description */}
            <p style={{
              fontSize: 14,
              color: "#94A3B8",
              lineHeight: 1.7,
              margin: "0 0 20px",
            }}>
              {m.description}
            </p>

            {/* Steps */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: "#475569",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}>
                Urutan Langkah
              </div>
              {m.steps.map((step, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}>
                  <div style={{
                    minWidth: 22,
                    height: 22,
                    borderRadius: 6,
                    background: m.colorDim,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: m.color,
                    fontFamily: "monospace",
                    marginTop: 1,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{
                    fontSize: 13,
                    color: "#CBD5E1",
                    lineHeight: 1.5,
                  }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div style={{
              background: "#12080A",
              border: "1px solid #7F1D1D",
              borderLeft: `3px solid #EF4444`,
              borderRadius: 8,
              padding: "12px 14px",
            }}>
              <span style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: "#EF4444",
                letterSpacing: "0.1em",
                display: "block",
                marginBottom: 4,
                textTransform: "uppercase",
              }}>
                ⚠ Pitfall
              </span>
              <p style={{
                fontSize: 12,
                color: "#94A3B8",
                margin: 0,
                lineHeight: 1.6,
              }}>
                {m.warning}
              </p>
            </div>
          </div>

          {/* Answer trail */}
          <div style={{
            background: "#0D1422",
            border: "1px solid #1E293B",
            borderRadius: 10,
            padding: "14px 16px",
            marginBottom: 12,
          }}>
            <div style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "#475569",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}>
              Alur Keputusan
            </div>
            {answers.map((a, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}>
                <span style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: "#334155",
                  minWidth: 20,
                }}>
                  Q{i + 1}
                </span>
                <span style={{
                  fontSize: 11,
                  color: "#475569",
                  flex: 1,
                  lineHeight: 1.4,
                }}>
                  {QUESTIONS[i].text.length > 60
                    ? QUESTIONS[i].text.slice(0, 60) + "…"
                    : QUESTIONS[i].text}
                </span>
                <span style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  color: a.a === "yes" ? "#10B981" : "#8B5CF6",
                  minWidth: 32,
                  textAlign: "right",
                }}>
                  {a.a === "yes" ? "YA" : "TIDAK"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div style={{
        width: "100%",
        maxWidth: 520,
        display: "flex",
        gap: 10,
      }}>
        {(history.length > 0 || result) && (
          <button
            onClick={handleBack}
            style={{
              flex: result ? 1 : "none",
              padding: "12px 20px",
              background: "transparent",
              border: "1px solid #1E293B",
              borderRadius: 10,
              color: "#64748B",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ← Kembali
          </button>
        )}
        {result && (
          <button
            onClick={handleRestart}
            style={{
              flex: 1,
              padding: "12px 20px",
              background: "#0D1422",
              border: "1px solid #1E293B",
              borderRadius: 10,
              color: "#94A3B8",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            ↺ Mulai Ulang
          </button>
        )}
      </div>

      {/* All methodologies overview */}
      {!result && currentQ === 0 && (
        <div style={{
          width: "100%",
          maxWidth: 520,
          marginTop: 32,
        }}>
          <div style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "#334155",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 12,
            textAlign: "center",
          }}>
            6 Metodologi Tersedia
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
          }}>
            {Object.values(METHODOLOGIES).map((met) => (
              <div key={met.id} style={{
                background: met.colorBg,
                border: `1px solid ${met.colorDim}`,
                borderTop: `2px solid ${met.color}`,
                borderRadius: 10,
                padding: "12px 10px",
                textAlign: "center",
              }}>
                <div style={{
                  fontSize: 18,
                  color: met.color,
                  marginBottom: 4,
                }}>
                  {met.icon}
                </div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#94A3B8",
                  lineHeight: 1.3,
                }}>
                  {met.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
