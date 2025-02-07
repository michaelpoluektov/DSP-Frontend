import numpy as np
from numpy.typing import NDArray
import scipy.signal as spsig


def _check_filter_freq(filter_freq: float, fs: float) -> float:
    """Check and saturate filter frequency."""
    if filter_freq > fs / 2:
        filter_freq = fs / 2
    return filter_freq


def _check_max_gain(gain: float, max_gain: float) -> float:
    """Check and saturate gain."""
    if gain > max_gain:
        gain = max_gain
    return gain


def _normalise_biquad(coeffs: list[float]) -> list[float]:
    """Normalize biquad coefficients by a0."""
    a0 = coeffs[3]
    return [c / a0 for c in [coeffs[0], coeffs[1], coeffs[2], coeffs[4], coeffs[5]]]


def make_biquad_bypass(fs: int) -> list[float]:
    """Create bypass filter coefficients."""
    return [1.0, 0.0, 0.0, 0.0, 0.0]


def make_biquad_lowpass(fs: int, filter_freq: float, q_factor: float) -> list[float]:
    """Create lowpass filter coefficients."""
    filter_freq = _check_filter_freq(filter_freq, fs)

    w0 = 2.0 * np.pi * filter_freq / fs
    alpha = np.sin(w0) / (2 * q_factor)

    b0 = (1.0 - np.cos(w0)) / 2.0
    b1 = 1.0 - np.cos(w0)
    b2 = (1.0 - np.cos(w0)) / 2.0
    a0 = 1.0 + alpha
    a1 = -2.0 * np.cos(w0)
    a2 = 1.0 - alpha

    return _normalise_biquad([b0, b1, b2, a0, a1, a2])


def make_biquad_highpass(fs: int, filter_freq: float, q_factor: float) -> list[float]:
    """Create highpass filter coefficients."""
    filter_freq = _check_filter_freq(filter_freq, fs)

    w0 = 2.0 * np.pi * filter_freq / fs
    alpha = np.sin(w0) / (2 * q_factor)

    b0 = (1.0 + np.cos(w0)) / 2.0
    b1 = -(1.0 + np.cos(w0))
    b2 = (1.0 + np.cos(w0)) / 2.0
    a0 = 1.0 + alpha
    a1 = -2.0 * np.cos(w0)
    a2 = 1.0 - alpha

    return _normalise_biquad([b0, b1, b2, a0, a1, a2])


def make_biquad_bandpass(fs: int, filter_freq: float, bandwidth: float) -> list[float]:
    filter_freq = _check_filter_freq(filter_freq, fs)

    w0 = 2.0 * np.pi * filter_freq / fs
    epsilon = 1e-8  # a small number to prevent division by zero
    # Use epsilon if np.sin(w0) is too small:
    denom = np.sin(w0) if np.abs(np.sin(w0)) > epsilon else epsilon
    alpha = np.sin(w0) * np.sinh((np.log(2) / 2) * bandwidth * w0 / denom)

    b0 = alpha
    b1 = 0.0
    b2 = -alpha
    a0 = 1.0 + alpha
    a1 = -2.0 * np.cos(w0)
    a2 = 1.0 - alpha

    return _normalise_biquad([b0, b1, b2, a0, a1, a2])


def make_biquad_bandstop(fs: int, filter_freq: float, bandwidth: float) -> list[float]:
    """Create bandstop filter coefficients."""
    filter_freq = _check_filter_freq(filter_freq, fs)

    w0 = 2.0 * np.pi * filter_freq / fs
    alpha = np.sin(w0) * np.sinh(np.log(2) / 2 * bandwidth * w0 / np.sin(w0))

    b0 = 1.0
    b1 = -2.0 * np.cos(w0)
    b2 = 1.0
    a0 = 1.0 + alpha
    a1 = -2.0 * np.cos(w0)
    a2 = 1.0 - alpha

    return _normalise_biquad([b0, b1, b2, a0, a1, a2])


def make_biquad_notch(fs: int, filter_freq: float, q_factor: float) -> list[float]:
    """Create notch filter coefficients."""
    filter_freq = _check_filter_freq(filter_freq, fs)

    w0 = 2.0 * np.pi * filter_freq / fs
    alpha = np.sin(w0) / (2.0 * q_factor)

    b0 = 1.0
    b1 = -2.0 * np.cos(w0)
    b2 = 1.0
    a0 = 1.0 + alpha
    a1 = -2.0 * np.cos(w0)
    a2 = 1.0 - alpha

    return _normalise_biquad([b0, b1, b2, a0, a1, a2])


def make_biquad_allpass(fs: int, filter_freq: float, q_factor: float) -> list[float]:
    """Create allpass filter coefficients."""
    filter_freq = _check_filter_freq(filter_freq, fs)

    w0 = 2.0 * np.pi * filter_freq / fs
    alpha = np.sin(w0) / (2.0 * q_factor)

    b0 = 1.0 - alpha
    b1 = -2.0 * np.cos(w0)
    b2 = 1.0 + alpha
    a0 = 1.0 + alpha
    a1 = -2.0 * np.cos(w0)
    a2 = 1.0 - alpha

    return _normalise_biquad([b0, b1, b2, a0, a1, a2])


def make_biquad_peaking(
    fs: int, filter_freq: float, q_factor: float, gain_db: float
) -> list[float]:
    """Create peaking filter coefficients."""
    filter_freq = _check_filter_freq(filter_freq, fs)
    max_gain = 18  # Typical max gain for peaking filters
    gain_db = _check_max_gain(gain_db, max_gain)

    A = np.sqrt(10 ** (gain_db / 20))
    w0 = 2.0 * np.pi * filter_freq / fs
    alpha = np.sin(w0) / (2.0 * q_factor)

    b0 = 1.0 + alpha * A
    b1 = -2.0 * np.cos(w0)
    b2 = 1.0 - alpha * A
    a0 = 1.0 + alpha / A
    a1 = -2.0 * np.cos(w0)
    a2 = 1.0 - alpha / A

    return _normalise_biquad([b0, b1, b2, a0, a1, a2])


def make_biquad_lowshelf(
    fs: int, filter_freq: float, q_factor: float, gain_db: float
) -> list[float]:
    """Create lowshelf filter coefficients."""
    filter_freq = _check_filter_freq(filter_freq, fs)
    max_gain = 18  # Typical max gain for shelf filters
    gain_db = _check_max_gain(gain_db, max_gain)

    A = np.sqrt(10 ** (gain_db / 20))
    w0 = 2.0 * np.pi * filter_freq / fs
    alpha = np.sin(w0) / (2.0 * q_factor)

    b0 = A * ((A + 1) - (A - 1) * np.cos(w0) + 2 * np.sqrt(A) * alpha)
    b1 = 2 * A * ((A - 1) - (A + 1) * np.cos(w0))
    b2 = A * ((A + 1) - (A - 1) * np.cos(w0) - 2 * np.sqrt(A) * alpha)
    a0 = (A + 1) + (A - 1) * np.cos(w0) + 2 * np.sqrt(A) * alpha
    a1 = -2 * ((A - 1) + (A + 1) * np.cos(w0))
    a2 = (A + 1) + (A - 1) * np.cos(w0) - 2 * np.sqrt(A) * alpha

    return _normalise_biquad([b0, b1, b2, a0, a1, a2])


def make_biquad_highshelf(
    fs: int, filter_freq: float, q_factor: float, gain_db: float
) -> list[float]:
    """Create highshelf filter coefficients."""
    filter_freq = _check_filter_freq(filter_freq, fs)
    max_gain = 18  # Typical max gain for shelf filters
    gain_db = _check_max_gain(gain_db, max_gain)

    A = np.sqrt(10 ** (gain_db / 20))
    w0 = 2.0 * np.pi * filter_freq / fs
    alpha = np.sin(w0) / (2.0 * q_factor)

    b0 = A * ((A + 1) + (A - 1) * np.cos(w0) + 2 * np.sqrt(A) * alpha)
    b1 = -2 * A * ((A - 1) + (A + 1) * np.cos(w0))
    b2 = A * ((A + 1) + (A - 1) * np.cos(w0) - 2 * np.sqrt(A) * alpha)
    a0 = (A + 1) - (A - 1) * np.cos(w0) + 2 * np.sqrt(A) * alpha
    a1 = 2 * ((A - 1) - (A + 1) * np.cos(w0))
    a2 = (A + 1) - (A - 1) * np.cos(w0) - 2 * np.sqrt(A) * alpha

    return _normalise_biquad([b0, b1, b2, a0, a1, a2])


def db_to_magnitude(db: float) -> float:
    """Convert dB to magnitude."""
    return 10 ** (db / 20)


def magnitude_to_db[T: float | NDArray](magnitude: T) -> T:
    """Convert magnitude to dB, protecting against log10(0)."""
    epsilon = 1e-6  # A small constant to avoid log10(0)
    return 20 * np.log10(np.maximum(np.abs(magnitude), epsilon))


def get_cascaded_biquad_response(filter_specs: list[dict], fs: int, nfft: int = 512):
    """Calculate the frequency response of cascaded biquads from filter specifications."""
    # Use a normalized frequency grid (0 to π rad/sample) for freqz.
    w = np.linspace(0, np.pi, nfft)
    h_total = np.ones(len(w), dtype=complex)

    filter_funcs = {
        "bypass": make_biquad_bypass,
        "lowpass": make_biquad_lowpass,
        "highpass": make_biquad_highpass,
        "bandpass": make_biquad_bandpass,
        "bandstop": make_biquad_bandstop,
        "notch": make_biquad_notch,
        "allpass": make_biquad_allpass,
        "peaking": make_biquad_peaking,
        "lowshelf": make_biquad_lowshelf,
        "highshelf": make_biquad_highshelf,
    }

    for spec in filter_specs:
        ftype = spec["type"].lower()
        if ftype not in filter_funcs:
            raise ValueError(f"Unknown filter type: {ftype}")

        make_func = filter_funcs[ftype]

        if ftype == "bypass":
            coeffs = make_func(fs)
        elif ftype in ["lowpass", "highpass", "notch", "allpass"]:
            coeffs = make_func(fs, spec["freq"], spec["q"])
        elif ftype in ["bandpass", "bandstop"]:
            coeffs = make_func(fs, spec["freq"], spec["bandwidth"])
        elif ftype in ["peaking", "lowshelf", "highshelf"]:
            coeffs = make_func(fs, spec["freq"], spec["q"], spec["gain"])

        # Build numerator and denominator.
        b = [coeffs[0], coeffs[1], coeffs[2]]
        a = [1, coeffs[3], coeffs[4]]

        # Compute frequency response for this biquad.
        _, h = spsig.freqz(b, a, worN=w)
        h_total *= h

    # Convert normalized frequency to Hz.
    freqs = w * fs / (2 * np.pi)
    return freqs, h_total


if __name__ == "__main__":
    import matplotlib.pyplot as plt

    fs = 48000
    filter_specs = [
        # Highpass to clear sub-bass rumble (tightens low end)
        {"type": "highpass", "freq": 60, "q": 0.707},
        # Low peaking boost for extra punch
        {"type": "peaking", "freq": 80, "q": 1.0, "gain": 3.0},
        # Mid scoop to remove boxiness and give that “metal” character
        {"type": "peaking", "freq": 500, "q": 0.8, "gain": -4.0},
        # Upper-mid boost for aggression and clarity
        {"type": "peaking", "freq": 3000, "q": 1.2, "gain": 4.0},
        # High shelf for brightness/“air”
        {"type": "highshelf", "freq": 8000, "q": 0.707, "gain": 3.0},
    ]

    # Get the frequency response using a fine grid.
    nfft = 1024
    freqs, response = get_cascaded_biquad_response(filter_specs, fs, nfft=nfft)

    # Convert magnitude to decibels and phase to degrees.
    mag_db = magnitude_to_db(response)
    phase_deg = np.angle(response, deg=True)

    # Create the figure and subplots.
    fig, (ax_mag, ax_phase) = plt.subplots(2, 1, figsize=(14, 10), sharex=True)

    # --- Magnitude Plot ---
    ax_mag.semilogx(freqs, mag_db, color="blue", lw=2, label="Magnitude Response")
    ax_mag.set_title("Cascaded Biquad EQ Frequency Response", fontsize=16)
    ax_mag.set_ylabel("Magnitude (dB)", fontsize=14)
    ax_mag.grid(True, which="both", linestyle="--", alpha=0.6)
    ax_mag.axhline(0, color="black", linestyle="--", lw=1)

    # Mark and annotate the center frequencies of each filter.
    for spec in filter_specs:
        if "freq" in spec:
            f = spec["freq"]
            # Draw a vertical dashed line at the filter frequency.
            ax_mag.axvline(f, color="red", linestyle=":", linewidth=1)
            # Annotate near the top of the passband.
            label_str = f"{spec['type'].capitalize()} @ {f} Hz"
            ax_mag.annotate(
                label_str,
                xy=(f, 0),
                xytext=(f, 5),
                textcoords="data",
                color="red",
                arrowprops=dict(arrowstyle="->", color="red"),
                horizontalalignment="center",
                fontsize=9,
            )

    # Set a useful dB range.
    ax_mag.set_ylim([-24, 24])
    ax_mag.legend(loc="upper right")

    # --- Phase Plot ---
    ax_phase.semilogx(freqs, phase_deg, color="green", lw=2, label="Phase Response")
    ax_phase.set_xlabel("Frequency (Hz)", fontsize=14)
    ax_phase.set_ylabel("Phase (degrees)", fontsize=14)
    ax_phase.grid(True, which="both", linestyle="--", alpha=0.6)
    ax_phase.legend(loc="upper right")

    # Fine-tune layout for clarity.
    plt.tight_layout()
    plt.show()
