
const alertFontSize = 14;

export const text = {
    alertInfo: {
        fontSize: alertFontSize,
        color: "#004085",
        backgroundColor: "#EEE",
        marginBottom: 5,
        marginTop: 5,
        overflow: "hidden" as const,
        textAlign: "left" as const,
        padding: 20
    },
    alertSuccess: {
        fontSize: alertFontSize,
        color: "#155724",
        backgroundColor: "#d4edda",
        borderColor: "#c3e6cb",
        padding: 3,
        marginBottom: 5,
        marginTop: 5,
        borderWidth: 1,
        borderRadius: 5,
        overflow: "hidden" as const,
        textAlign: "center" as const
    },
    alertDanger: {
        fontSize: alertFontSize,
        color: "#721c24",
        backgroundColor: "#f8d7da",
        borderColor: "#f5c6cb",
        padding: 3,
        marginBottom: 5,
        marginTop: 5,
        borderWidth: 1,
        borderRadius: 20,
        overflow: "hidden" as const,
        textAlign: "center" as const
    },
    data: {
        color: "white",
        fontWeight: "bold" as const,
        marginTop: 2,
        marginLeft: 5
    },
    dataDark: {
        color: "#444",
        fontWeight: "bold" as const,
        marginTop: 2,
        marginLeft: 5,
        shadowColor: "#FFF",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 1
    },
    label: {
        color: "#DDD",
        fontSize: 16,
        fontFamily: "Rubik-Regular"
    },
    labelDark: {
        color: "#333",
        fontSize: 16,
        shadowColor: "#FFF",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 1,
        marginTop: 5
    },
    largeText: {
        marginTop: 10,
        fontSize: 20,
        color: "#FFF"
    },
    statusMessage: {
        color: "#444",
        fontSize: 12,
        fontWeight: "bold" as const,
        marginBottom: 10,
        shadowColor: "#FFF",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 1,
        height: 30,
        paddingTop: 8,
        paddingLeft: 10
    },
    teamSearchOwner: {
        textAlign: "right" as const,
        color: "#444",
        fontSize: 12,
        fontWeight: "bold" as const,
        shadowColor: "#FFF",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 1
    },
    teamSearchName: {
        textAlign: "center" as const,
        color: "white",
        fontSize: 18,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.6,
        shadowRadius: 1
    },
    teamSearchTown: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold" as const,
        textAlign: "left" as const
    },
    teamTitle: {
        color: "white",
        fontSize: 22,
        marginBottom: 0,
        textAlign: "center" as const,
        padding: 10
    },
    text: {
        color: "white",
        fontSize: 18,
        marginBottom: 10,
        shadowColor: "#000"
    },
    textBlock: {
        padding: 5,
        backgroundColor: "white",
        color: "#444",
        fontSize: 14,
        fontWeight: "bold" as const,
        marginBottom: 10,
        shadowColor: "#FFF",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 1
    },
    textDark: {
        color: "#444",
        fontSize: 24,
        fontWeight: "bold" as const,
        marginBottom: 10,
        shadowColor: "#FFF",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 1
    },
    headerText: {
        color: "#444",
        fontWeight: "bold" as const,
        fontSize: 22,
        textAlign: "center" as const,
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: 0,
        paddingBottom: 5,
        backgroundColor: "#EEE"
    }
};