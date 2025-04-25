"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (response.ok) {
        // 회원가입 성공 후 자동 로그인
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.ok) {
          alert("회원가입이 성공적으로 완료되었습니다!");
          router.push("/");
          router.refresh();
        } else {
          alert("로그인에 실패했습니다. 다시 시도해주세요.");
        }
      } else {
        const data = await response.json();
        alert(data.message || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#232425]">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#2a2b2c] rounded-2xl">
        <div>
          <h2 className="text-center text-3xl font-bold text-white">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            계정을 생성하여 서비스를 이용하세요
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">이름</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 rounded-xl bg-[#232425] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent autofill:bg-[#232425] autofill:text-white"
                placeholder="이름"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 rounded-xl bg-[#232425] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent autofill:bg-[#232425] autofill:text-white"
                placeholder="이메일"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">비밀번호</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 rounded-xl bg-[#232425] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent autofill:bg-[#232425] autofill:text-white"
                placeholder="비밀번호"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">비밀번호 확인</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 rounded-xl bg-[#232425] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent autofill:bg-[#232425] autofill:text-white"
                placeholder="비밀번호 확인"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 cursor-pointer"
            >
              회원가입
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            이미 계정이 있으신가요?{" "}
            <a
              href="/auth/signin"
              className="font-medium text-gray-300 hover:text-white"
            >
              로그인
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 