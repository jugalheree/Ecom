import MainLayout from "./components/layout/MainLayout";
import AppRoutes from "./routes/AppRoutes";
import ToastContainer from "./components/ui/Toast";

export default function App() {
  return (
    <>
      <MainLayout>
        <AppRoutes />
      </MainLayout>
      
      <ToastContainer />
    </>
  );
}
