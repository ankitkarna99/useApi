import React from "react";
import { useHistory } from "react-router";
import NotificationService from "../services/NotificationService";

interface ExecuteOptions {
  showFailureNotification?: boolean;
  loadingStates?: boolean;
  keepBusyOnSuccess?: boolean;
  initialLoadingTrigger?: boolean;
}

const ExecuteOptionsDefault: ExecuteOptions = {
  showFailureNotification: true,
  loadingStates: true,
  initialLoadingTrigger: true,
};

function useApi() {
  const [error, setError] = React.useState<any>(null);
  const [busy, setBusy] = React.useState<boolean>(false);

  const history = useHistory();

  const clearError = () => {
    setError(null);
  };

  const execute = async <T>(
    apiRequest: Promise<T>,
    options: ExecuteOptions = {}
  ): Promise<T> => {
    options = { ...ExecuteOptionsDefault, ...options };
    try {
      if (options.loadingStates) {
        setBusy(true);
      }

      const response = await apiRequest;
      if (options.loadingStates) {
        if (!options.keepBusyOnSuccess) {
          setBusy(false);
        }
      }
      return response;
    } catch (err: any) {
      if (options.loadingStates) {
        setBusy(false);
        setError(err);
      }
      if (options.showFailureNotification) {
        NotificationService.showNotification("error", err);
      }
      throw err;
    }
  };

  const fetch = async <T>(
    apiRequest: Promise<T>,
    options: ExecuteOptions = {}
  ): Promise<T> => {
    options = { ...ExecuteOptionsDefault, ...options };
    clearError();
    if (options.loadingStates) {
      setBusy(true);
    }
    try {
      const response = await apiRequest;
      if (options.loadingStates) {
        if (options.initialLoadingTrigger) {
          setBusy(false);
        }
      }
      return response;
    } catch (err: any) {
      if (options.loadingStates) {
        setBusy(false);
        setError(err);
      }

      if (options.showFailureNotification && err !== "Expectation failure") {
        NotificationService.showNotification("error", err);
      }

      if (err === "Access denied!") {
        history.replace("/logout");
      }

      if (err === "Expectation failure") {
        if (history) {
          history.replace("/set-business");
        }
      }

      throw err;
    }
  };

  return {
    error,
    setError,
    busy,
    setBusy,
    hasError: error != null,
    clearError,
    execute,
    fetch,
  };
}

export default useApi;
