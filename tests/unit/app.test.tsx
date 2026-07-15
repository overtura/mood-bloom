import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../../src/app/App";

describe("앱 첫 화면", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("핵심 입력과 privacy 안내를 제공한다", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /오늘의 한 문장이/ })).toBeInTheDocument();
    expect(screen.getByLabelText("오늘을 한 문장으로 남겨보세요")).toBeInTheDocument();
    expect(screen.getByText(/브라우저 안에서만 처리하고 저장/)).toBeInTheDocument();
  });
});
