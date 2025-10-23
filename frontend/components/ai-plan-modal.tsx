"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { MeTTaTrace } from "@/components/metta-trace"
import { TransactionStepper } from "@/components/transaction-stepper"
import { useBackend } from "@/hooks/useBackend"
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import type { Position } from "@/hooks/usePositions"

interface Action {
  order: number;
  action_type: string;
  token: string;
  amount: number;
  reason: string;
  src_chain_id?: string;
  dst_chain_id?: string;
}

interface ActionsResponse {
  user_address: string;
  positions_with_actions: Array<{
    chain_id: string;
    chain_name: string;
    supplied_assets: Array<{ token: string; amount: number; usd_value?: number }>;
    borrowed_assets: Array<{ token: string; amount: number; usd_value?: number }>;
    health_factor: number;
    risk_level: string;
    actions?: Action[];
  }>;
}

export function AIPlanModal({
  open,
  onOpenChange,
  position,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  position: Position
  onSuccess?: () => void
}) {
  const { toast } = useToast()
  const { generateActions } = useBackend()
  const [loading, setLoading] = React.useState(false)
  const [actions, setActions] = React.useState<Action[]>([])
  const [executing, setExecuting] = React.useState(false)
  const [executedActions, setExecutedActions] = React.useState<Set<number>>(new Set())

  const generateAIActions = async () => {
    setLoading(true)
    setActions([])
    try {
      const response: ActionsResponse = await generateActions([position.chain_id])
      
      // Find the position that matches our current position
      const positionWithActions = response.positions_with_actions.find(
        p => p.chain_id === position.chain_id
      )
      
      if (positionWithActions?.actions) {
        setActions(positionWithActions.actions)
        toast({
          title: "AI Analysis Complete",
          description: `Generated ${positionWithActions.actions.length} actions to improve your position.`,
        })
      } else {
        toast({
          title: "No Actions Available",
          description: "No actions were generated for this position.",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error('Error generating actions:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate actions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const executeAction = async (action: Action) => {
    setExecuting(true)
    try {
      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setExecutedActions(prev => new Set([...prev, action.order]))
      
      toast({
        title: "Action Executed",
        description: `${action.action_type} completed successfully.`,
      })
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: "Failed to execute action. Please try again.",
        variant: "destructive"
      })
    } finally {
      setExecuting(false)
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'supply':
      case 'deposit':
        return '📈'
      case 'repay':
      case 'withdraw':
        return '📉'
      case 'swap':
        return '🔄'
      case 'bridge':
        return '🌉'
      default:
        return '⚡'
    }
  }

  const getActionColor = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'supply':
      case 'deposit':
        return 'text-green-600 bg-green-50'
      case 'repay':
      case 'withdraw':
        return 'text-blue-600 bg-blue-50'
      case 'swap':
        return 'text-purple-600 bg-purple-50'
      case 'bridge':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  React.useEffect(() => {
    if (open) {
      // Reset state when modal opens
      setActions([])
      setExecutedActions(new Set())
      setExecuting(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="plan-desc" className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Recovery Plan</DialogTitle>
          <DialogDescription id="plan-desc">
            AI-generated actions to improve your health factor on {position.chain_name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Position Overview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Position Overview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Health Factor:</span>
                <span className={`ml-2 font-medium ${
                  position.health_factor < 1.2 ? 'text-red-600' : 
                  position.health_factor < 1.5 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {position.health_factor.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Risk Level:</span>
                <span className={`ml-2 font-medium ${
                  position.risk_level === 'HIGH' ? 'text-red-600' : 
                  position.risk_level === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {position.risk_level}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Collateral:</span>
                <span className="ml-2 font-medium">${position.total_collateral_usd.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Borrowed:</span>
                <span className="ml-2 font-medium">${position.total_borrowed_usd.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="font-medium">Generating AI Actions</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Analyzing your position and generating optimal recovery steps...
                </p>
              </div>
            </div>
          ) : actions.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-medium">Recommended Actions</h4>
              <div className="space-y-3">
                {actions.map((action, index) => (
                  <div
                    key={action.order}
                    className={`border rounded-lg p-4 transition-all ${
                      executedActions.has(action.order) 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          executedActions.has(action.order) 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {executedActions.has(action.order) ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            action.order
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">{getActionIcon(action.action_type)}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(action.action_type)}`}>
                              {action.action_type.toUpperCase()}
                            </span>
                          </div>
                          <p className="font-medium text-sm">
                            {action.amount.toFixed(4)} {action.token}
                            {action.src_chain_id && action.dst_chain_id && (
                              <span className="text-muted-foreground ml-2">
                                from {action.src_chain_id} to {action.dst_chain_id}
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{action.reason}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        {executedActions.has(action.order) ? (
                          <div className="flex items-center text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Executed
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => executeAction(action)}
                            disabled={executing}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            {executing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                Execute
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Actions Generated</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click the button below to generate AI-powered recovery actions for your position.
              </p>
              <Button onClick={generateAIActions} className="bg-primary text-primary-foreground">
                Generate AI Actions
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {actions.length === 0 && !loading && (
              <Button onClick={generateAIActions} className="bg-primary text-primary-foreground">
                Generate AI Actions
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
