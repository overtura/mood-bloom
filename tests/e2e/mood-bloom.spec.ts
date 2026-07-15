import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route(/huggingface\.co|hf\.co/, (route) => route.abort());
});

async function openWithEmptyGarden(page: import("@playwright/test").Page, path: string) {
  await page.goto(path);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

test("첫 기록부터 Future Bloom과 정원 복원까지 이어진다", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await openWithEmptyGarden(page, "/");
  await page.getByLabel("오늘을 한 문장으로 남겨보세요").fill("바쁜 하루 끝에 따뜻한 차 한 잔이 오래 기억에 남았다.");
  await page.getByRole("button", { name: "오늘의 식물 피우기" }).click();
  await expect(page.getByRole("heading", { name: /첫 빛을 만났어요/ })).toBeVisible({ timeout: 12_000 });
  await expect(page.getByText(/가벼운 기기 내 규칙/)).toBeVisible();

  const savedBeforePreview = await page.evaluate(() => localStorage.getItem("mood-bloom:garden:v1"));
  await page.getByRole("button", { name: /미래 정원 미리보기/ }).click();
  await page.getByRole("button", { name: "Day 30" }).click();
  await expect(page.getByText("달빛 정원")).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(() => Array.from(document.querySelectorAll("*")).some(
    (element) => element.getBoundingClientRect().right > window.innerWidth + 1,
  ));
  expect(hasHorizontalOverflow).toBe(false);
  expect(await page.evaluate(() => localStorage.getItem("mood-bloom:garden:v1"))).toBe(savedBeforePreview);

  await page.getByRole("link", { name: "정원" }).click();
  await expect(page.getByRole("heading", { name: "씨앗 정원" })).toBeVisible();
  await page.reload();
  await expect(page.getByText("바쁜 하루 끝에 따뜻한 차 한 잔이 오래 기억에 남았다.", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("설정, JSON 백업과 복원을 지원한다", async ({ page }) => {
  await openWithEmptyGarden(page, "/settings");
  const reducedMotion = page.getByRole("checkbox", { name: /움직임 줄이기/ });
  await reducedMotion.check();
  await expect(reducedMotion).toBeChecked();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "정원 내보내기" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^mood-bloom-.*\.json$/);
  const backupPath = await download.path();
  expect(backupPath).toBeTruthy();

  await page.getByRole("button", { name: "백업 불러오기" }).click();
  await page.locator('input[type="file"]').setInputFiles(backupPath!);
  await expect(page.getByRole("status")).toContainText("복원했습니다");

  await page.reload();
  await expect(page.getByRole("checkbox", { name: /움직임 줄이기/ })).toBeChecked();
  await expect(page.getByText(/외부 AI 추론 API를 호출하지 않습니다/)).toBeVisible();
});
