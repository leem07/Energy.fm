function LoginPage() {
  const handleLogin = () => {
    window.location.href = "http://127.0.0.1:8888/login";
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center gap-4
                 bg-[#0C1D1F] text-white"
      style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
    >
      <h1 className="text-4xl font-bold">Welcome Back!</h1>
      <h2>Connect to your spotify account.</h2>

      <button
        onClick={handleLogin}
        className="px-8 py-4 text-lg font-medium rounded-xl bg-cyan-400 text-black hover:scale-105 transition"
      >
        Link Account
      </button>
    </div>
  );
}

export default LoginPage;